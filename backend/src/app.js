import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';
// Import routes
import healthRoutes from './routes/health';
import emotionalRoutes from './routes/emotional';
import indexRoutes from './routes/index';
const app = express();
// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
app.use(cors({
    origin: [config.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
}));
// Compression
app.use(compression());
// ✅ CORREÇÃO: Content-Type validation ANTES de body parsing
app.use('/api/emotional/analyze', (req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) {
        return res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json',
            timestamp: new Date().toISOString()
        });
    }
    return next();
});
// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type')
    });
    next();
});
// Health routes (before rate limiting)
app.use('/api', healthRoutes);
// Rate limiting (after health checks)
app.use('/api/emotional', rateLimitMiddleware);
// API routes
app.use('/', indexRoutes);
app.use('/api/emotional', emotionalRoutes);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});
// Method not allowed handler
app.use((err, req, res, next) => {
    if (err.status === 405 || err.code === 'ENOTALLOWED') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: `Method ${req.method} not allowed for ${req.path}`,
            timestamp: new Date().toISOString()
        });
    }
    return next(err);
});
// Global error handler
app.use(errorHandler);
export default app;
