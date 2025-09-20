export class PerformanceMonitor {
  private isMonitoring: boolean = false;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsCallback?: (metrics: any) => void;
  private performanceCallback?: (issue: string) => void;
  private sessionStart: number = Date.now();
  private metrics: any = {
    fps: 60,
    inputLatency: 0,
    memoryUsage: 0,
    sessionStart: this.sessionStart
  };

  startMonitoring(fpsCallback?: (metrics: any) => void, performanceCallback?: (issue: string) => void): void {
    this.isMonitoring = true;
    this.fpsCallback = fpsCallback;
    this.performanceCallback = performanceCallback;
    this.lastTime = performance.now();
    this.measureFPS();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private measureFPS(): void {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Calcular uso de memória (estimativa)
      if ('memory' in performance) {
        // @ts-ignore
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
      }

      if (this.fpsCallback) {
        this.fpsCallback(this.metrics);
      }

      // Verificar problemas de performance
      if (this.metrics.fps < 30 && this.performanceCallback) {
        this.performanceCallback('Low FPS detected');
      }
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  mark(name: string): void {
    if ('mark' in performance) {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark: string): void {
    if ('measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        // Marks não existem, ignorar
      }
    }
  }

  measureRenderTime(startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.renderTime = renderTime;
  }

  measureInputLatency(inputTime: number): void {
    const latency = performance.now() - inputTime;
    this.metrics.inputLatency = latency;
  }

  updateFrame(particleCount: number): void {
    this.metrics.particleCount = particleCount;
  }

  getMetrics(): any {
    return { ...this.metrics };
  }
}
