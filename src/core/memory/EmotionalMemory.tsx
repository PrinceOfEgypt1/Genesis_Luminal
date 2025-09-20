interface EmotionalState {
  position: { x: number; y: number };
  intensity: number;
  audioMode: string;
  sessionTime: number;
  timestamp: number;
}

interface PersonalizedRecommendations {
  suggestedColors: number[];
  adaptiveSettings: {
    particleCount: number;
    visualComplexity: number;
    audioSensitivity: number;
  };
  personalityInsights: string[];
}

interface ProfileStats {
  totalSessions: number;
  personalityType: string;
  explorationScore: number;
  memoryEntries: number;
  averageIntensity: number;
}

export class EmotionalMemory {
  private storageKey: string = 'genesis_emotional_memory';
  private emotionalStates: EmotionalState[] = [];
  private personalityProfile: any = {};

  constructor() {
    this.loadFromStorage();
  }

  recordEmotionalState(
    position: { x: number; y: number },
    intensity: number,
    audioMode: string,
    sessionTime: number
  ): void {
    const state: EmotionalState = {
      position,
      intensity,
      audioMode,
      sessionTime,
      timestamp: Date.now()
    };

    this.emotionalStates.push(state);
    
    // Manter apenas os últimos 1000 estados
    if (this.emotionalStates.length > 1000) {
      this.emotionalStates = this.emotionalStates.slice(-1000);
    }

    this.updatePersonalityProfile();
    this.saveToStorage();
  }

  private updatePersonalityProfile(): void {
    const states = this.emotionalStates;
    if (states.length === 0) return;

    const avgIntensity = states.reduce((sum, s) => sum + s.intensity, 0) / states.length;
    const avgX = states.reduce((sum, s) => sum + s.position.x, 0) / states.length;
    const avgY = states.reduce((sum, s) => sum + s.position.y, 0) / states.length;

    // Determinar tipo de personalidade baseado nos padrões
    let personalityType = 'Explorador';
    if (avgIntensity > 0.7) {
      personalityType = 'Energético';
    } else if (avgIntensity < 0.3) {
      personalityType = 'Contemplativo';
    } else if (avgX < 0.3 || avgX > 0.7) {
      personalityType = 'Analítico';
    }

    this.personalityProfile = {
      type: personalityType,
      averageIntensity: avgIntensity,
      preferredRegion: { x: avgX, y: avgY },
      explorationScore: this.calculateExplorationScore(states),
      totalSessions: this.personalityProfile.totalSessions || 0
    };
  }

  private calculateExplorationScore(states: EmotionalState[]): number {
    const uniqueRegions = new Set();
    states.forEach(state => {
      const regionX = Math.floor(state.position.x * 10);
      const regionY = Math.floor(state.position.y * 10);
      uniqueRegions.add(`${regionX},${regionY}`);
    });
    return Math.min(100, (uniqueRegions.size / 100) * 100);
  }

  getPersonalizedRecommendations(): PersonalizedRecommendations {
    const states = this.emotionalStates;
    const profile = this.personalityProfile;

    // Gerar cores personalizadas baseadas no histórico
    const suggestedColors: number[] = [];
    if (states.length > 0) {
      const avgX = states.reduce((sum, s) => sum + s.position.x, 0) / states.length;
      const avgY = states.reduce((sum, s) => sum + s.position.y, 0) / states.length;
      
      suggestedColors.push(avgX * 360);
      suggestedColors.push((avgY * 360 + 120) % 360);
      suggestedColors.push((avgX * avgY * 360 + 240) % 360);
    } else {
      // Cores padrão
      suggestedColors.push(280, 320, 200);
    }

    return {
      suggestedColors,
      adaptiveSettings: {
        particleCount: profile.type === 'Energético' ? 3000 : 2000,
        visualComplexity: profile.averageIntensity || 0.8,
        audioSensitivity: profile.averageIntensity || 0.7
      },
      personalityInsights: [
        `Tipo: ${profile.type || 'Explorador'}`,
        `Exploração: ${profile.explorationScore || 0}%`,
        `Intensidade preferida: ${Math.round((profile.averageIntensity || 0.5) * 100)}%`
      ]
    };
  }

  getProfileStats(): ProfileStats {
    return {
      totalSessions: this.personalityProfile.totalSessions || 1,
      personalityType: this.personalityProfile.type || 'Explorador',
      explorationScore: this.personalityProfile.explorationScore || 0,
      memoryEntries: this.emotionalStates.length,
      averageIntensity: this.personalityProfile.averageIntensity || 0.5
    };
  }

  private saveToStorage(): void {
    try {
      const data = {
        emotionalStates: this.emotionalStates.slice(-100), // Salvar apenas os últimos 100
        personalityProfile: this.personalityProfile
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.log('💾 Erro ao salvar memória emocional');
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.emotionalStates = data.emotionalStates || [];
        this.personalityProfile = data.personalityProfile || {};
        this.personalityProfile.totalSessions = (this.personalityProfile.totalSessions || 0) + 1;
      }
    } catch (error) {
      console.log('💾 Erro ao carregar memória emocional');
    }
  }
}
