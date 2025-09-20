/**
 * @fileoverview Sistema de Monitoramento de Performance
 * 
 * Monitora FPS, latência de input, uso de memória e performance geral
 * para garantir que o Genesis Luminal atenda aos critérios estabelecidos.
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

interface PerformanceMetrics {
  fps: number;
  inputLatency: number;
  memoryUsage: number;
  renderTime: number;
  particleCount: number;
  audioLatency: number;
}

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsHistory: number[] = [];
  private inputLatencyHistory: number[] = [];
  private renderTimeHistory: number[] = [];
  private isMonitoring: boolean = false;
  
  // Callbacks de performance
  private onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  private onPerformanceIssue?: (issue: string) => void;

  constructor() {
    this.bindPerformanceObserver();
  }

  /**
   * Inicia monitoramento de performance
   */
  startMonitoring(
    onUpdate?: (metrics: PerformanceMetrics) => void,
    onIssue?: (issue: string) => void
  ): void {
    this.isMonitoring = true;
    this.onPerformanceUpdate = onUpdate;
    this.onPerformanceIssue = onIssue;
    this.lastTime = performance.now();
  }

  /**
   * Para monitoramento
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.onPerformanceUpdate = undefined;
    this.onPerformanceIssue = undefined;
  }

  /**
   * Atualiza métricas a cada frame
   */
  updateFrame(particleCount: number = 0): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.fpsHistory.push(currentFPS);
      
      // Manter apenas últimos 60 frames
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.frameCount++;
      
      // Reportar métricas a cada 30 frames
      if (this.frameCount % 30 === 0) {
        this.reportMetrics(particleCount);
      }
    }
    
    this.lastTime = currentTime;
  }

  /**
   * Mede latência de input
   */
  measureInputLatency(inputTime: number): void {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const latency = currentTime - inputTime;
    
    this.inputLatencyHistory.push(latency);
    
    // Manter apenas últimas 30 medições
    if (this.inputLatencyHistory.length > 30) {
      this.inputLatencyHistory.shift();
    }
    
    // Alerta se latência > 16ms
    if (latency > 16 && this.onPerformanceIssue) {
      this.onPerformanceIssue(`Input latency high: ${latency.toFixed(2)}ms`);
    }
  }

  /**
   * Mede tempo de renderização
   */
  measureRenderTime(renderStartTime: number): void {
    if (!this.isMonitoring) return;
    
    const renderTime = performance.now() - renderStartTime;
    this.renderTimeHistory.push(renderTime);
    
    if (this.renderTimeHistory.length > 30) {
      this.renderTimeHistory.shift();
    }
  }

  /**
   * Calcula uso de memória
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Reporta métricas consolidadas
   */
  private reportMetrics(particleCount: number): void {
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const avgInputLatency = this.inputLatencyHistory.reduce((a, b) => a + b, 0) / this.inputLatencyHistory.length;
    const avgRenderTime = this.renderTimeHistory.reduce((a, b) => a + b, 0) / this.renderTimeHistory.length;
    
    const metrics: PerformanceMetrics = {
      fps: avgFPS,
      inputLatency: avgInputLatency,
      renderTime: avgRenderTime,
      memoryUsage: this.getMemoryUsage(),
      particleCount,
      audioLatency: 0 // Será implementado no sistema de áudio
    };
    
    this.onPerformanceUpdate?.(metrics);
    
    // Verificar critérios de performance
    this.checkPerformanceCriteria(metrics);
  }

  /**
   * Verifica se atende aos critérios estabelecidos
   */
  private checkPerformanceCriteria(metrics: PerformanceMetrics): void {
    if (metrics.fps < 50 && this.onPerformanceIssue) {
      this.onPerformanceIssue(`FPS baixo: ${metrics.fps.toFixed(1)} (target: >60)`);
    }
    
    if (metrics.inputLatency > 16 && this.onPerformanceIssue) {
      this.onPerformanceIssue(`Input latency alta: ${metrics.inputLatency.toFixed(2)}ms (target: <16ms)`);
    }
    
    if (metrics.memoryUsage > 100 && this.onPerformanceIssue) {
      this.onPerformanceIssue(`Uso de memória alto: ${metrics.memoryUsage.toFixed(1)}MB`);
    }
  }

  /**
   * Configura Performance Observer para métricas avançadas
   */
  private bindPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure' && entry.name.includes('genesis')) {
              console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'mark'] });
      } catch (error) {
        console.log('Performance Observer not supported');
      }
    }
  }

  /**
   * Cria marca de performance
   */
  mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`genesis-${name}`);
    }
  }

  /**
   * Mede intervalo entre duas marcas
   */
  measure(name: string, startMark: string, endMark?: string): void {
    if ('performance' in window && 'measure' in performance) {
      const start = `genesis-${startMark}`;
      const end = endMark ? `genesis-${endMark}` : undefined;
      performance.measure(`genesis-${name}`, start, end);
    }
  }
}
