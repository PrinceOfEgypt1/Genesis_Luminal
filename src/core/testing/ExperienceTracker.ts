/**
 * @fileoverview Sistema de Teste de Experiência do Usuário
 * 
 * Monitora e avalia a experiência do usuário em tempo real para garantir
 * que o Genesis Luminal atenda aos critérios de "encantamento em 3 segundos"
 * e "taxa de retenção > 90% na primeira sessão".
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  interactions: UserInteraction[];
  emotionalPeaks: EmotionalPeak[];
  encantamentTime?: number;
  retentionScore: number;
}

interface UserInteraction {
  timestamp: number;
  type: 'mouse_move' | 'click' | 'audio_enable' | 'debug_toggle';
  intensity: number;
  position: { x: number; y: number };
  duration: number;
}

interface EmotionalPeak {
  timestamp: number;
  intensity: number;
  duration: number;
  trigger: string;
}

interface ExperienceMetrics {
  encantamentRate: number; // % de usuários encantados em 3s
  averageSessionDuration: number;
  retentionRate: number;
  interactionFrequency: number;
  emotionalEngagement: number;
}

export class ExperienceTracker {
  private currentSession: UserSession | null = null;
  private allSessions: UserSession[] = [];
  private encantamentThreshold: number = 3000; // 3 segundos
  private interactionStartTime: number = 0;

  /**
   * Inicia uma nova sessão de usuário
   */
  startSession(): string {
    const sessionId = `genesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      interactions: [],
      emotionalPeaks: [],
      retentionScore: 0
    };

    console.log(`Nova sessão de teste iniciada: ${sessionId}`);
    return sessionId;
  }

  /**
   * Registra uma interação do usuário
   */
  trackInteraction(
    type: UserInteraction['type'],
    intensity: number,
    position: { x: number; y: number }
  ): void {
    if (!this.currentSession) return;

    const now = Date.now();
    const interaction: UserInteraction = {
      timestamp: now,
      type,
      intensity,
      position,
      duration: now - this.interactionStartTime
    };

    this.currentSession.interactions.push(interaction);

    // Detectar primeiro movimento significativo (possível encantamento)
    if (type === 'mouse_move' && intensity > 0.3 && !this.currentSession.encantamentTime) {
      const timeToFirstInteraction = now - this.currentSession.startTime;
      if (timeToFirstInteraction <= this.encantamentThreshold) {
        this.currentSession.encantamentTime = timeToFirstInteraction;
        console.log(`Encantamento detectado em ${timeToFirstInteraction}ms`);
      }
    }

    // Detectar picos emocionais
    if (intensity > 0.7) {
      this.trackEmotionalPeak(intensity, `${type}_high_intensity`);
    }

    this.interactionStartTime = now;
  }

  /**
   * Registra um pico emocional
   */
  private trackEmotionalPeak(intensity: number, trigger: string): void {
    if (!this.currentSession) return;

    const peak: EmotionalPeak = {
      timestamp: Date.now(),
      intensity,
      duration: 0, // Será calculado posteriormente
      trigger
    };

    this.currentSession.emotionalPeaks.push(peak);
  }

  /**
   * Finaliza a sessão atual
   */
  endSession(): UserSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.retentionScore = this.calculateRetentionScore();

    // Armazenar sessão
    this.allSessions.push(this.currentSession);
    
    // Manter apenas últimas 50 sessões para não sobrecarregar memória
    if (this.allSessions.length > 50) {
      this.allSessions.shift();
    }

    const session = this.currentSession;
    this.currentSession = null;

    console.log(`Sessão finalizada: ${session.sessionId}, Score: ${session.retentionScore.toFixed(2)}`);
    return session;
  }

  /**
   * Calcula score de retenção baseado em múltiplos fatores
   */
  private calculateRetentionScore(): number {
    if (!this.currentSession) return 0;

    const session = this.currentSession;
    const sessionDuration = (session.endTime || Date.now()) - session.startTime;
    
    let score = 0;

    // Duração da sessão (peso: 30%)
    const durationScore = Math.min(sessionDuration / 60000, 1) * 0.3; // Max 1 minuto
    
    // Frequência de interações (peso: 25%)
    const interactionScore = Math.min(session.interactions.length / 20, 1) * 0.25;
    
    // Encantamento inicial (peso: 20%)
    const encantamentScore = session.encantamentTime ? 0.2 : 0;
    
    // Picos emocionais (peso: 15%)
    const emotionalScore = Math.min(session.emotionalPeaks.length / 5, 1) * 0.15;
    
    // Ativação de áudio (peso: 10%)
    const audioScore = session.interactions.some(i => i.type === 'audio_enable') ? 0.1 : 0;

    score = durationScore + interactionScore + encantamentScore + emotionalScore + audioScore;
    
    return Math.min(score, 1) * 100; // Converter para porcentagem
  }

  /**
   * Gera métricas de experiência consolidadas
   */
  getExperienceMetrics(): ExperienceMetrics {
    if (this.allSessions.length === 0) {
      return {
        encantamentRate: 0,
        averageSessionDuration: 0,
        retentionRate: 0,
        interactionFrequency: 0,
        emotionalEngagement: 0
      };
    }

    const encantedSessions = this.allSessions.filter(s => s.encantamentTime !== undefined);
    const encantamentRate = (encantedSessions.length / this.allSessions.length) * 100;

    const avgDuration = this.allSessions.reduce((sum, s) => {
      const duration = (s.endTime || Date.now()) - s.startTime;
      return sum + duration;
    }, 0) / this.allSessions.length;

    const retentionRate = this.allSessions.reduce((sum, s) => sum + s.retentionScore, 0) / this.allSessions.length;

    const avgInteractions = this.allSessions.reduce((sum, s) => sum + s.interactions.length, 0) / this.allSessions.length;

    const avgEmotionalPeaks = this.allSessions.reduce((sum, s) => sum + s.emotionalPeaks.length, 0) / this.allSessions.length;

    return {
      encantamentRate,
      averageSessionDuration: avgDuration,
      retentionRate,
      interactionFrequency: avgInteractions,
      emotionalEngagement: avgEmotionalPeaks
    };
  }

  /**
   * Verifica se os critérios de sucesso foram atingidos
   */
  checkSuccessCriteria(): {
    encantamentTarget: boolean; // > 80% em 3s
    retentionTarget: boolean;   // > 90% na primeira sessão
    overall: boolean;
  } {
    const metrics = this.getExperienceMetrics();
    
    return {
      encantamentTarget: metrics.encantamentRate > 80,
      retentionTarget: metrics.retentionRate > 90,
      overall: metrics.encantamentRate > 80 && metrics.retentionRate > 90
    };
  }
}
