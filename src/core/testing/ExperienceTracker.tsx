interface UserInteraction {
  timestamp: number;
  type: 'mouse_move' | 'click' | 'audio_enable' | 'debug_toggle';
  intensity: number;
  position: { x: number; y: number };
  duration?: number;
}

interface ExperienceMetrics {
  encantamentRate: number;
  averageSessionDuration: number;
  retentionRate: number;
  interactionFrequency: number;
  emotionalEngagement: number;
}

export class ExperienceTracker {
  private sessionId: string = '';
  private sessionStart: number = 0;
  private interactions: UserInteraction[] = [];
  private encantamentDetected: boolean = false;
  private encantamentTime?: number;

  startSession(): string {
    this.sessionId = `genesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStart = Date.now();
    this.interactions = [];
    this.encantamentDetected = false;
    
    console.log(`📊 Nova sessão iniciada: ${this.sessionId}`);
    return this.sessionId;
  }

  endSession(): void {
    const sessionDuration = Date.now() - this.sessionStart;
    console.log(`📊 Sessão finalizada: ${sessionDuration}ms, ${this.interactions.length} interações`);
  }

  trackInteraction(
    type: UserInteraction['type'],
    intensity: number,
    position: { x: number; y: number }
  ): void {
    const interaction: UserInteraction = {
      timestamp: Date.now(),
      type,
      intensity,
      position
    };

    this.interactions.push(interaction);

    // Detectar encantamento (primeira interação significativa em 3 segundos)
    if (!this.encantamentDetected && intensity > 0.3) {
      const timeFromStart = Date.now() - this.sessionStart;
      if (timeFromStart <= 3000) {
        this.encantamentDetected = true;
        this.encantamentTime = timeFromStart;
        console.log(`✨ Encantamento detectado em ${timeFromStart}ms`);
      }
    }
  }

  getExperienceMetrics(): ExperienceMetrics {
    const sessionDuration = Date.now() - this.sessionStart;
    const avgIntensity = this.interactions.reduce((sum, i) => sum + i.intensity, 0) / Math.max(1, this.interactions.length);
    
    return {
      encantamentRate: this.encantamentDetected ? 100 : 0,
      averageSessionDuration: sessionDuration,
      retentionRate: sessionDuration > 30000 ? 95 : 70, // Simulado
      interactionFrequency: this.interactions.length / (sessionDuration / 1000),
      emotionalEngagement: avgIntensity * 100
    };
  }

  getSessionId(): string {
    return this.sessionId;
  }
}
