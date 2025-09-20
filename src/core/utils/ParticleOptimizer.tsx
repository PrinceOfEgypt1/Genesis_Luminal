export class ParticleOptimizer {
  private currentFPS: number = 60;
  private targetFPS: number = 60;
  private qualityLevel: number = 1.0;
  private adaptiveSettings: any = {
    particleCount: 2000,
    visualComplexity: 0.8,
    enableGlow: true,
    enableBlur: true
  };

  updateFPS(fps: number): void {
    this.currentFPS = fps;
    this.adjustQuality();
  }

  private adjustQuality(): void {
    if (this.currentFPS < 45) {
      this.qualityLevel = Math.max(0.3, this.qualityLevel - 0.1);
      this.adaptiveSettings.particleCount = Math.max(500, this.adaptiveSettings.particleCount * 0.9);
      this.adaptiveSettings.visualComplexity = Math.max(0.3, this.adaptiveSettings.visualComplexity * 0.9);
    } else if (this.currentFPS > 55) {
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
      this.adaptiveSettings.particleCount = Math.min(3000, this.adaptiveSettings.particleCount * 1.05);
      this.adaptiveSettings.visualComplexity = Math.min(1.0, this.adaptiveSettings.visualComplexity * 1.05);
    }
  }

  getOptimizedSettings(): any {
    return {
      quality: this.qualityLevel,
      particleCount: Math.floor(this.adaptiveSettings.particleCount),
      visualComplexity: this.adaptiveSettings.visualComplexity,
      enableEffects: this.qualityLevel > 0.5
    };
  }

  getOptimalParticleCount(): number {
    return Math.floor(this.adaptiveSettings.particleCount);
  }
}
