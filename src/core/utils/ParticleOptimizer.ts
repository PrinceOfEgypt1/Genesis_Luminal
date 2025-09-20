/**
 * @fileoverview Sistema de Otimização de Partículas
 * 
 * Optimiza renderização e cálculos de partículas para manter 60 FPS
 * através de técnicas como LOD, culling e adaptive quality.
 */

export interface OptimizedParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  visible: boolean;
  lastUpdate: number;
}

export class ParticleOptimizer {
  private targetFPS: number = 60;
  private currentFPS: number = 60;
  private adaptiveQuality: number = 1.0;
  private maxParticles: number = 2000;
  private minParticles: number = 500;
  
  // Configurações de LOD (Level of Detail)
  private lodDistances = {
    high: 150,    // Distância para qualidade alta
    medium: 300,  // Distância para qualidade média
    low: 500      // Distância para qualidade baixa
  };

  /**
   * Atualiza FPS atual e ajusta qualidade adaptivamente
   */
  updateFPS(fps: number): void {
    this.currentFPS = fps;
    
    // Ajustar qualidade baseado no FPS
    if (fps < 45) {
      this.adaptiveQuality = Math.max(0.3, this.adaptiveQuality - 0.1);
    } else if (fps > 55) {
      this.adaptiveQuality = Math.min(1.0, this.adaptiveQuality + 0.05);
    }
  }

  /**
   * Calcula número otimizado de partículas
   */
  getOptimalParticleCount(): number {
    const baseCount = 2000;
    const optimizedCount = Math.floor(baseCount * this.adaptiveQuality);
    return Math.max(this.minParticles, Math.min(this.maxParticles, optimizedCount));
  }

  /**
   * Aplica culling por frustum (remove partículas fora da tela)
   */
  frustumCull(
    particles: OptimizedParticle[], 
    centerX: number, 
    centerY: number,
    width: number, 
    height: number
  ): OptimizedParticle[] {
    const margin = 100; // Margem para partículas fora da tela
    
    return particles.filter(particle => {
      // Projeção 3D para 2D
      const perspective = 400;
      const scale = perspective / (perspective + particle.z);
      const projectedX = centerX + particle.x * scale;
      const projectedY = centerY + particle.y * scale;
      
      // Verificar se está dentro do frustum
      const inFrustum = 
        projectedX >= -margin && 
        projectedX <= width + margin &&
        projectedY >= -margin && 
        projectedY <= height + margin &&
        particle.z > -500; // Distância mínima
      
      particle.visible = inFrustum;
      return inFrustum;
    });
  }

  /**
   * Aplica LOD (Level of Detail) baseado na distância
   */
  applyLOD(particles: OptimizedParticle[], cameraDistance: number = 0): void {
    particles.forEach(particle => {
      const distance = Math.sqrt(
        particle.x * particle.x + 
        particle.y * particle.y + 
        particle.z * particle.z
      );
      
      // Determinar nível de detalhe
      if (distance < this.lodDistances.high) {
        // Alta qualidade - atualizar a cada frame
        particle.lastUpdate = 0;
      } else if (distance < this.lodDistances.medium) {
        // Média qualidade - atualizar a cada 2 frames
        if (Date.now() - particle.lastUpdate < 33) return;
        particle.lastUpdate = Date.now();
      } else {
        // Baixa qualidade - atualizar a cada 4 frames
        if (Date.now() - particle.lastUpdate < 66) return;
        particle.lastUpdate = Date.now();
      }
    });
  }

  /**
   * Reduz partículas dinamicamente se necessário
   */
  adaptiveParticleReduction(particles: OptimizedParticle[]): OptimizedParticle[] {
    const targetCount = this.getOptimalParticleCount();
    
    if (particles.length <= targetCount) {
      return particles;
    }
    
    // Remover partículas mais distantes primeiro
    return particles
      .sort((a, b) => {
        const distA = a.x * a.x + a.y * a.y + a.z * a.z;
        const distB = b.x * b.x + b.y * b.y + b.z * b.z;
        return distB - distA;
      })
      .slice(0, targetCount);
  }

  /**
   * Otimiza renderização usando batching
   */
  batchRender(
    particles: OptimizedParticle[],
    ctx: CanvasRenderingContext2D,
    renderFunction: (particle: OptimizedParticle, ctx: CanvasRenderingContext2D) => void
  ): void {
    // Agrupar partículas por propriedades similares para reduzir mudanças de estado
    const batches = new Map<string, OptimizedParticle[]>();
    
    particles.forEach(particle => {
      if (!particle.visible) return;
      
      // Criar chave de batch baseada em propriedades de renderização
      const batchKey = `${Math.floor(particle.hue / 30)}-${Math.floor(particle.size)}`;
      
      if (!batches.has(batchKey)) {
        batches.set(batchKey, []);
      }
      batches.get(batchKey)!.push(particle);
    });
    
    // Renderizar cada batch
    batches.forEach(batch => {
      ctx.save();
      batch.forEach(particle => renderFunction(particle, ctx));
      ctx.restore();
    });
  }

  /**
   * Retorna configurações otimizadas baseadas na performance atual
   */
  getOptimizedSettings(): {
    particleCount: number;
    quality: number;
    updateInterval: number;
    enableLOD: boolean;
    enableCulling: boolean;
  } {
    return {
      particleCount: this.getOptimalParticleCount(),
      quality: this.adaptiveQuality,
      updateInterval: this.currentFPS < 50 ? 2 : 1, // Reduzir update rate se necessário
      enableLOD: this.adaptiveQuality < 0.8,
      enableCulling: this.adaptiveQuality < 0.9
    };
  }
}
