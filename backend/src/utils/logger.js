/**
 * Sistema de logging
 */
import winston from 'winston';
import { config } from '../config/environment';
export const logger = winston.createLogger({
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ]
});
// --- auto-injected: demote known Claude quota/rate-limit errors to WARN ---
const __SUPPRESS_CLAUDE = process.env.SUPPRESS_CLAUDE_QUOTA_LOGS === 'true';
if (__SUPPRESS_CLAUDE) {
    const __origError = logger.error?.bind(logger) || ((..._a) => { });
    logger.error = (...args) => {
        try {
            const msg = String(args?.[0] ?? '');
            if (/(Claude API error).*(usage limits|rate limit|insufficient_quota|invalid_request_error)/i.test(msg)) {
                // demote to warn
                return logger.warn?.(...args);
            }
        }
        catch { }
        return __origError(...args);
    };
}
// --- end auto-injected ---
