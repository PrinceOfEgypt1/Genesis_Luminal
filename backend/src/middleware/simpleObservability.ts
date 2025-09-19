/**
 * @fileoverview Middleware Simples de Observabilidade
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { 
  incrementHttpRequest, 
  recordHttpDuration, 
  incrementActiveConnections, 
  decrementActiveConnections 
} from '../metrics';

export interface RequestWithMetrics extends Request {
  correlationId: string;
  startTime: number;
}

export function simpleObservabilityMiddleware(
  req: RequestWithMetrics,
  res: Response,
  next: NextFunction
): void {
  // Correlation ID
  const correlationId = req.headers['x-correlation-id'] as string || 
                       req.headers['x-request-id'] as string || 
                       uuidv4();
  
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  // Headers de resposta
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-service', 'genesis-luminal-api');
  
  // Log estruturado
  logger.info('HTTP Request started', {
    correlationId,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent')
  });
  
  // Incrementar conexões ativas
  incrementActiveConnections();
  
  // Registrar métricas quando resposta for enviada
  res.on('finish', () => {
    try {
      const duration = (Date.now() - req.startTime) / 1000; // segundos
      const route = req.route?.path || req.path || 'unknown';
      
      // Registrar métricas
      incrementHttpRequest(req.method, route, res.statusCode);
      recordHttpDuration(req.method, route, duration);
      
      // Log de conclusão
      logger.info('HTTP Request completed', {
        correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${(duration * 1000).toFixed(2)}ms`
      });
      
      // Decrementar conexões ativas
      decrementActiveConnections();
    } catch (error) {
      logger.error('Error in observability middleware:', error);
    }
  });
  
  next();
}

export function emotionalAnalysisMiddleware(
  req: RequestWithMetrics,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('x-analysis-type', 'emotional');
  next();
}
