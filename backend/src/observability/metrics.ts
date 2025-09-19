/**
 * @fileoverview Genesis Luminal Metrics - Prometheus Native
 * 
 * Sistema de métricas funcional usando prom-client diretamente
 * para garantir observabilidade imediata e confiável
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Inicializar coleta de métricas padrão do sistema
collectDefaultMetrics({ 
  prefix: 'genesis_',
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

/**
 * MÉTRICAS DE LATÊNCIA
 */

// Latência de análise emocional por provider
export const emotionalAnalysisLatency = new Histogram({
  name: 'genesis_emotional_analysis_duration_seconds',
  help: 'Duration of emotional analysis requests',
  labelNames: ['provider', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

// Latência de requests HTTP
export const httpRequestLatency = new Histogram({
  name: 'genesis_http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
});

// Latência de cache
export const cacheLatency = new Histogram({
  name: 'genesis_cache_duration_seconds', 
  help: 'Duration of cache operations',
  labelNames: ['operation', 'result'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1]
});

/**
 * MÉTRICAS DE THROUGHPUT
 */

// Contador de análises emocionais
export const emotionalAnalysisCounter = new Counter({
  name: 'genesis_emotional_analysis_total',
  help: 'Total number of emotional analysis requests',
  labelNames: ['provider', 'success']
});

// Contador de requests HTTP
export const httpRequestCounter = new Counter({
  name: 'genesis_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Contador de operações de cache
export const cacheCounter = new Counter({
  name: 'genesis_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result']
});

/**
 * MÉTRICAS DE ERRO
 */

// Contador de erros de análise emocional
export const emotionalAnalysisErrorCounter = new Counter({
  name: 'genesis_emotional_analysis_errors_total',
  help: 'Total number of emotional analysis errors',
  labelNames: ['provider', 'error_type']
});

// Contador de erros HTTP
export const httpErrorCounter = new Counter({
  name: 'genesis_http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code']
});

/**
 * MÉTRICAS DE CIRCUIT BREAKER
 */

// Estado do circuit breaker
export const circuitBreakerState = new Gauge({
  name: 'genesis_circuit_breaker_state',
  help: 'Current state of circuit breakers (0=CLOSED, 1=OPEN, 2=HALF_OPEN)',
  labelNames: ['provider']
});

// Contador de trips do circuit breaker
export const circuitBreakerTrips = new Counter({
  name: 'genesis_circuit_breaker_trips_total',
  help: 'Total number of circuit breaker trips',
  labelNames: ['provider']
});

/**
 * MÉTRICAS DE NEGÓCIO
 */

// Conexões ativas
export const activeConnections = new Gauge({
  name: 'genesis_active_connections',
  help: 'Number of active connections'
});

// Tipos de emoção detectadas
export const emotionTypesCounter = new Counter({
  name: 'genesis_emotion_types_total',
  help: 'Total count by emotion type detected',
  labelNames: ['emotion_type', 'intensity_range']
});

/**
 * UTILITÁRIOS PARA REGISTRO DE MÉTRICAS
 */

/**
 * Registra latência de análise emocional
 */
export function recordEmotionalAnalysisLatency(
  durationMs: number,
  provider: string,
  success: boolean
): void {
  const durationSeconds = durationMs / 1000;
  
  emotionalAnalysisLatency
    .labels(provider, success.toString())
    .observe(durationSeconds);
  
  emotionalAnalysisCounter
    .labels(provider, success.toString())
    .inc();
  
  if (!success) {
    emotionalAnalysisErrorCounter
      .labels(provider, 'analysis_failed')
      .inc();
  }
}

/**
 * Registra latência de request HTTP
 */
export function recordHttpRequestLatency(
  durationMs: number,
  method: string,
  route: string,
  statusCode: number
): void {
  const durationSeconds = durationMs / 1000;
  
  httpRequestLatency
    .labels(method, route, statusCode.toString())
    .observe(durationSeconds);
  
  httpRequestCounter
    .labels(method, route, statusCode.toString())
    .inc();
  
  if (statusCode >= 400) {
    httpErrorCounter
      .labels(method, route, statusCode.toString())
      .inc();
  }
}

/**
 * Registra operação de cache
 */
export function recordCacheOperation(
  operation: string,
  durationMs: number,
  hit: boolean,
  error?: boolean
): void {
  const durationSeconds = durationMs / 1000;
  const result = hit ? 'hit' : 'miss';
  
  cacheLatency
    .labels(operation, result)
    .observe(durationSeconds);
  
  cacheCounter
    .labels(operation, result)
    .inc();
}

/**
 * Registra mudança de estado do circuit breaker
 */
export function recordCircuitBreakerState(
  provider: string,
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
): void {
  const stateValue = state === 'CLOSED' ? 0 : state === 'OPEN' ? 1 : 2;
  
  circuitBreakerState
    .labels(provider)
    .set(stateValue);
  
  if (state === 'OPEN') {
    circuitBreakerTrips
      .labels(provider)
      .inc();
  }
}

/**
 * Registra tipo de emoção detectada
 */
export function recordEmotionType(emotionType: string, intensity: number): void {
  const intensityRange = intensity > 0.8 ? 'high' : intensity > 0.5 ? 'medium' : 'low';
  
  emotionTypesCounter
    .labels(emotionType, intensityRange)
    .inc();
}

/**
 * Atualiza conexões ativas
 */
export function incrementActiveConnections(): void {
  activeConnections.inc();
}

export function decrementActiveConnections(): void {
  activeConnections.dec();
}

/**
 * Obtém registry de métricas para endpoint /metrics
 */
export function getMetricsRegistry() {
  return register;
}

/**
 * Limpa todas as métricas (útil para testes)
 */
export function clearMetrics(): void {
  register.clear();
}
