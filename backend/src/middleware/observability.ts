/**
 * @fileoverview Middleware de Observabilidade
 * 
 * Middleware Express para correlation IDs, métricas e logging
 * estruturado usando ferramentas consolidadas
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

import { Request, Response, NextFunction } from 'express';
import { 
  generateCorrelationId, 
  createTraceContext,
  finishTraceSuccess,
  finishTraceError 
} from '../observability/tracing';
import { 
  recordHttpRequestLatency,
  incrementActiveConnections,
  decrementActiveConnections 
} from '../observability/metrics';

/**
 * Interface estendida do Request com observabilidade
 */
export interface ObservabilityRequest extends Request {
  correlationId: string;
  startTime: number;
}

/**
 * Middleware principal de observabilidade
 */
export function observabilityMiddleware(
  req: ObservabilityRequest,
  res: Response,
  next: NextFunction
): void {
  // Gerar ou usar correlation ID existente
  const correlationId = 
    req.headers['x-correlation-id'] as string ||
    req.headers['x-request-id'] as string ||
    generateCorrelationId();
  
  // Adicionar ao request
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  // Adicionar aos headers de resposta
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-request-id', correlationId);
  res.setHeader('x-service', 'genesis-luminal-api');
  
  // Criar contexto de trace
  createTraceContext(correlationId, `${req.method} ${req.path}`, {
    userId: req.headers['x-user-id'] as string,
    sessionId: req.headers['x-session-id'] as string
  });
  
  // Incrementar conexões ativas
  incrementActiveConnections();
  
  // Registrar métricas quando resposta for enviada
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const route = req.route?.path || req.path || 'unknown';
    
    // Registrar métricas HTTP
    recordHttpRequestLatency(
      duration,
      req.method,
      route,
      res.statusCode
    );
    
    // Finalizar trace
    if (res.statusCode >= 400) {
      finishTraceError(correlationId, new Error(`HTTP ${res.statusCode}`));
    } else {
      finishTraceSuccess(correlationId);
    }
    
    // Decrementar conexões ativas
    decrementActiveConnections();
  });
  
  next();
}

/**
 * Middleware para análise emocional
 */
export function emotionalAnalysisObservability(
  req: ObservabilityRequest,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('x-analysis-type', 'emotional');
  res.setHeader('x-feature', 'ai-analysis');
  
  next();
}

/**
 * Middleware para health checks (observabilidade reduzida)
 */
export function healthObservability(
  req: ObservabilityRequest,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('x-health-check', 'true');
  // Health checks não precisam de trace completo
  next();
}
