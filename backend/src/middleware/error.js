import { logger } from '../utils/logger';
export function errorHandler(err, req, res, next) {
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString(),
        path: req.path
    });
}
