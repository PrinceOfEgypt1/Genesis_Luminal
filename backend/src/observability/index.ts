/**
 * @fileoverview Genesis Luminal Observability
 * 
 * Módulo principal de observabilidade usando ferramentas
 * consolidadas e funcionais
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

export * from './metrics';
export * from './tracing';

/**
 * Interface para status de observabilidade
 */
export interface ObservabilityStatus {
  metrics: boolean;
  tracing: boolean;
  prometheus_endpoint: string;
  correlation_ids: boolean;
  structured_logging: boolean;
  active_connections: number;
}

/**
 * Obtém status da observabilidade
 */
export function getObservabilityStatus(): ObservabilityStatus {
  return {
    metrics: true,
    tracing: true,
    prometheus_endpoint: '/metrics',
    correlation_ids: true,
    structured_logging: true,
    active_connections: 0 // Será atualizado pelas métricas
  };
}
