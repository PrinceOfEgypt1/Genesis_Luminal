/**
 * GENESIS LUMINAL - RATE LIMITING [COMPATIBILIDADE ORIGINAL]
 * Mantém exatamente os exports que o index.ts original espera
 */
import { RateLimiterMemory } from 'rate-limiter-flexible';
// Configuração original preservada
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const MAX_POINTS = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const durationSecRaw = WINDOW_MS / 1000;
const durationSec = Number.isFinite(durationSecRaw) ? Math.max(1, Math.floor(durationSecRaw)) : 900;
const limiter = new RateLimiterMemory({
    points: Number.isFinite(MAX_POINTS) ? MAX_POINTS : 100,
    duration: durationSec,
    blockDuration: durationSec,
});
function clientKey(req) {
    const xf = req.headers['x-forwarded-for'];
    const xfFirst = Array.isArray(xf)
        ? xf[0]
        : (typeof xf === 'string' ? xf.split(',')[0] : undefined);
    const ip = req.ip ?? xfFirst ?? req.socket?.remoteAddress ?? 'unknown';
    return String(ip).trim();
}
// ✅ CORREÇÃO: Função com return paths corretos
export async function rateLimit(req, res, next) {
    try {
        await limiter.consume(clientKey(req));
        next(); // ✅ Sucesso: continua pipeline
        return; // ✅ Return explícito
    }
    catch (rejRes) {
        const msBeforeNext = rejRes?.msBeforeNext ?? 60_000;
        const retryAfter = Math.max(1, Math.round(msBeforeNext / 1000));
        res.setHeader('Retry-After', String(retryAfter));
        res.status(429).json({ message: 'Too Many Requests', retryAfter });
        return; // ✅ Return explícito após response
    }
}
// ✅ CRÍTICO: Mantém compatibilidade EXATA com index.ts original
export { rateLimit as rateLimitMiddleware };
export default rateLimit;
