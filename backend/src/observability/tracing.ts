/**
 * @fileoverview Genesis Luminal Tracing - Correlation IDs
 * 
 * Sistema de tracing simples e funcional usando correlation IDs
 * e logging estruturado com Winston
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Interface para contexto de trace
 */
export interface TraceContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  sessionId?: string;
  provider?: string;
  operation: string;
  startTime: number;
}

/**
 * Storage local para contexto de trace (usando AsyncLocalStorage seria ideal)
 */
const traceContextStorage = new Map<string, TraceContext>();

/**
 * Gera correlation ID único
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Gera request ID único
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cria contexto de trace
 */
export function createTraceContext(
  correlationId: string,
  operation: string,
  options: Partial<TraceContext> = {}
): TraceContext {
  const context: TraceContext = {
    correlationId,
    requestId: generateRequestId(),
    operation,
    startTime: Date.now(),
    ...options
  };
  
  traceContextStorage.set(correlationId, context);
  
  logger.info('Trace started', {
    correlationId: context.correlationId,
    requestId: context.requestId,
    operation: context.operation,
    userId: context.userId || 'anonymous',
    provider: context.provider || 'unknown'
  });
  
  return context;
}

/**
 * Obtém contexto de trace atual
 */
export function getCurrentTraceContext(correlationId: string): TraceContext | undefined {
  return traceContextStorage.get(correlationId);
}

/**
 * Finaliza trace com sucesso
 */
export function finishTraceSuccess(
  correlationId: string,
  result?: any
): void {
  const context = traceContextStorage.get(correlationId);
  if (!context) return;
  
  const duration = Date.now() - context.startTime;
  
  logger.info('Trace completed successfully', {
    correlationId: context.correlationId,
    requestId: context.requestId,
    operation: context.operation,
    duration_ms: duration,
    success: true,
    result_type: result ? typeof result : 'void'
  });
  
  traceContextStorage.delete(correlationId);
}

/**
 * Finaliza trace com erro
 */
export function finishTraceError(
  correlationId: string,
  error: Error
): void {
  const context = traceContextStorage.get(correlationId);
  if (!context) return;
  
  const duration = Date.now() - context.startTime;
  
  logger.error('Trace completed with error', {
    correlationId: context.correlationId,
    requestId: context.requestId,
    operation: context.operation,
    duration_ms: duration,
    success: false,
    error_message: error.message,
    error_type: error.constructor.name,
    stack: error.stack
  });
  
  traceContextStorage.delete(correlationId);
}

/**
 * Instrumenta função com tracing
 */
export async function withTrace<T>(
  correlationId: string,
  operation: string,
  fn: () => Promise<T>,
  options: Partial<TraceContext> = {}
): Promise<T> {
  const context = createTraceContext(correlationId, operation, options);
  
  try {
    const result = await fn();
    finishTraceSuccess(correlationId, result);
    return result;
  } catch (error) {
    finishTraceError(correlationId, error as Error);
    throw error;
  }
}

/**
 * Instrumenta análise emocional com tracing
 */
export async function withEmotionalAnalysisTrace<T>(
  correlationId: string,
  provider: string,
  textLength: number,
  fn: () => Promise<T>
): Promise<T> {
  return withTrace(correlationId, 'emotional_analysis', fn, {
    provider,
    metadata: { text_length: textLength }
  });
}

/**
 * Log de evento dentro de trace
 */
export function logTraceEvent(
  correlationId: string,
  event: string,
  data?: any
): void {
  const context = traceContextStorage.get(correlationId);
  
  logger.info('Trace event', {
    correlationId,
    requestId: context?.requestId || 'unknown',
    operation: context?.operation || 'unknown',
    event,
    event_data: data,
    elapsed_ms: context ? Date.now() - context.startTime : 0
  });
}
