/**
 * GENESIS LUMINAL BACKEND WITH OBSERVABILITY
 * Servidor principal com integração Claude API e observabilidade funcional
 */

import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { 
  observabilityMiddleware, 
  emotionalAnalysisObservability,
  healthObservability 
} from './middleware/observability';
import { getMetricsRegistry } from './observability/metrics';
import { getObservabilityStatus } from './observability';
import { logger } from './utils/logger';

const app = express();

// Timeout configurável
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

// Middleware de timeout
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: `Request exceeded ${REQUEST_TIMEOUT_MS}ms limit`
      });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// 📊 OBSERVABILIDADE - Primeiro middleware após timeout
app.use(observabilityMiddleware);

// Security & Performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Body parsing com limite reduzido
app.use(express.json({ limit: '1mb' }));
app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health routes ANTES do rate limiting (com observabilidade reduzida)
app.use('/api/health', healthObservability);
app.use('/api', healthRouter);

// 📊 ENDPOINT DE MÉTRICAS PROMETHEUS
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', getMetricsRegistry().contentType);
    const metrics = await getMetricsRegistry().metrics();
    res.send(metrics);
  } catch (error) {
    logger.error('Error generating metrics', error);
    res.status(500).send('Error generating metrics');
  }
});

// 📊 ENDPOINT DE STATUS DE OBSERVABILIDADE  
app.get('/api/observability/status', (req, res) => {
  const status = getObservabilityStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString(),
    service: 'genesis-luminal-api',
    version: '1.0.0'
  });
});

// Rate limiting aplicado APÓS rotas de saúde
app.use(rateLimitMiddleware);

// Observabilidade específica para análise emocional
app.use('/api/emotional', emotionalAnalysisObservability);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  const observabilityStatus = getObservabilityStatus();
  
  logger.info(`🚀 Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`🔡 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'configured' : 'missing'}`);
  
  // Log observability status
  logger.info('📊 Observability Status:', observabilityStatus);
  logger.info(`📈 Metrics endpoint: http://localhost:${PORT}/metrics`);
  logger.info(`📋 Observability status: http://localhost:${PORT}/api/observability/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🔄 Graceful shutdown initiated');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🔄 Graceful shutdown initiated');
  process.exit(0);
});
