/**
 * @fileoverview Genesis Luminal Metrics - Implementação Mínima Funcional
 */

import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { logger } from '../utils/logger';

// Inicializar métricas padrão do sistema
collectDefaultMetrics({ 
  prefix: 'genesis_',
  timeout: 5000 
});

// Métricas customizadas básicas
export const httpRequestsTotal = new Counter({
  name: 'genesis_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestDuration = new Histogram({
  name: 'genesis_http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const activeConnections = new Gauge({
  name: 'genesis_active_connections',
  help: 'Number of active connections'
});

export const emotionalAnalysisTotal = new Counter({
  name: 'genesis_emotional_analysis_total',
  help: 'Total emotional analysis requests',
  labelNames: ['provider', 'success']
});

// Utilitários
export function incrementHttpRequest(method: string, route: string, statusCode: number): void {
  try {
    httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
  } catch (error) {
    logger.error('Error incrementing HTTP request metric:', error);
  }
}

export function recordHttpDuration(method: string, route: string, durationSeconds: number): void {
  try {
    httpRequestDuration.labels(method, route).observe(durationSeconds);
  } catch (error) {
    logger.error('Error recording HTTP duration:', error);
  }
}

export function incrementActiveConnections(): void {
  try {
    activeConnections.inc();
  } catch (error) {
    logger.error('Error incrementing active connections:', error);
  }
}

export function decrementActiveConnections(): void {
  try {
    activeConnections.dec();
  } catch (error) {
    logger.error('Error decrementing active connections:', error);
  }
}

export function incrementEmotionalAnalysis(provider: string, success: boolean): void {
  try {
    emotionalAnalysisTotal.labels(provider, success.toString()).inc();
  } catch (error) {
    logger.error('Error incrementing emotional analysis metric:', error);
  }
}

// Registry para endpoint /metrics
export { register as metricsRegistry };

export function initializeMetrics(): void {
  logger.info('📊 Metrics initialized successfully');
  logger.info('📈 Metrics available at /metrics endpoint');
}
