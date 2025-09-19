import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(3001),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    // Flags
    CLAUDE_OFFLINE_MODE: z.enum(['true', 'false']).default('false'),
    SUPPRESS_CLAUDE_QUOTA_LOGS: z.enum(['true', 'false']).default('true'),
    // Anthropic
    CLAUDE_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    // Circuit breaker / retry
    CB_FAILURE_THRESHOLD: z.coerce.number().default(3),
    CB_COOLDOWN_SECONDS: z.coerce.number().default(3600), // 1h após quota
    RETRY_BASE_MS: z.coerce.number().default(500), // backoff base
    RETRY_MAX_MS: z.coerce.number().default(10000), // teto do backoff
});
export const env = envSchema.parse(process.env);
export function apiKey() {
    return env.CLAUDE_API_KEY || env.ANTHROPIC_API_KEY;
}
