import { env } from '../config/env';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import { logger } from '../utils/logger';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function jitter(ms) { const j = Math.floor(ms * 0.2); return ms + Math.floor(Math.random() * j); }
export class ProviderRouter {
    primary;
    fallback;
    state = 'CLOSED';
    failures = 0;
    nextRetryAt = 0;
    lastErrorCode;
    constructor(primary, fallback) {
        this.primary = primary ?? new AnthropicProvider();
        this.fallback = fallback ?? new FallbackProvider();
    }
    getStatus() {
        return {
            state: this.state,
            failures: this.failures,
            nextRetryAt: this.nextRetryAt || null,
            lastErrorCode: this.lastErrorCode || null,
            offlineMode: env.CLAUDE_OFFLINE_MODE === 'true',
            primary: this.primary.name,
            fallback: this.fallback.name,
        };
    }
    openCircuit(reason, cooldownMs) {
        if (this.state !== 'OPEN') {
            logger.warn('Circuit opened (primary disabled)', { reason, cooldownMs });
        }
        this.state = 'OPEN';
        this.nextRetryAt = Date.now() + cooldownMs;
    }
    closeCircuit() {
        if (this.state !== 'CLOSED') {
            logger.info('Circuit closed (primary enabled again)');
        }
        this.state = 'CLOSED';
        this.failures = 0;
        this.nextRetryAt = 0;
        this.lastErrorCode = undefined;
    }
    async tryPrimary(input) {
        const base = env.RETRY_BASE_MS;
        const max = env.RETRY_MAX_MS;
        let attempt = 0;
        for (;;) {
            try {
                return await this.primary.analyze(input);
            }
            catch (err) {
                attempt++;
                this.lastErrorCode = err?.code || 'UNKNOWN';
                const msg = err?.details?.error?.message || '';
                if (String(this.lastErrorCode).includes('usage') || /usage limits|quota/i.test(msg)) {
                    this.openCircuit('quota_exceeded', env.CB_COOLDOWN_SECONDS * 1000);
                    throw err;
                }
                this.failures++;
                const delay = Math.min(max, Math.pow(2, attempt - 1) * base);
                if (attempt >= 2)
                    throw err;
                await sleep(jitter(delay));
            }
        }
    }
    async analyze(input) {
        if (env.CLAUDE_OFFLINE_MODE === 'true') {
            return this.fallback.analyze(input);
        }
        const now = Date.now();
        if (this.state === 'OPEN') {
            if (now < this.nextRetryAt) {
                return this.fallback.analyze(input);
            }
            this.state = 'HALF_OPEN';
        }
        try {
            const res = await this.tryPrimary(input);
            this.closeCircuit();
            return res;
        }
        catch {
            if (this.state === 'HALF_OPEN') {
                this.openCircuit(this.lastErrorCode || 'half_open_fail', env.CB_COOLDOWN_SECONDS * 1000);
            }
            else if (this.failures >= env.CB_FAILURE_THRESHOLD) {
                this.openCircuit(this.lastErrorCode || 'threshold_reached', 30_000);
            }
            if (env.SUPPRESS_CLAUDE_QUOTA_LOGS !== 'true') {
                logger.warn('Primary provider failed, serving fallback', { code: this.lastErrorCode });
            }
            else {
                logger.debug('Primary disabled / fallback', { code: this.lastErrorCode, state: this.state });
            }
            return this.fallback.analyze(input);
        }
    }
}
