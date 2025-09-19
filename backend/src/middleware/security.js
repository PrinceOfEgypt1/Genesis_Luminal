/**
 * Middleware de segurança básica para compatibilidade
 */
import { logger } from '../utils/logger';
// Middleware para log de requests suspeitos
export const securityLogger = (req, res, next) => {
    const suspiciousPatterns = [
        /\.\./g, // Path traversal
        /<script/gi, // XSS
        /union.*select/gi, // SQL injection
        /javascript:/gi, // JavaScript injection
        /vbscript:/gi // VBScript injection
    ];
    const url = req.url.toLowerCase();
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const body = JSON.stringify(req.body || {}).toLowerCase();
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url) || pattern.test(userAgent) || pattern.test(body));
    if (isSuspicious) {
        logger.warn('Request suspeito detectado', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.headers['user-agent'],
            body: req.body
        });
    }
    next();
};
export default {
    securityLogger
};
