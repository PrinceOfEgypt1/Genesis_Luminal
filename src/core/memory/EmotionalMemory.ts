/**
 * @fileoverview Sistema de Memória Emocional Persistente
 * 
 * Armazena e recupera padrões emocionais do usuário para criar
 * experiências personalizadas e progressivamente mais refinadas.
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

interface EmotionalMemoryEntry {
  timestamp: number;
  emotionalState: {
    mousePosition: { x: number; y: number };
    intensity: number;
    audioScale: string;
    sessionDuration: number;
  };
  context: {
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    season: string;
  };
  preferences: {
    preferredColors: number[]; // Hues
    preferredIntensity: number;
    audioPreference: string;
  };
}

interface EmotionalProfile {
  id: string;
  createdAt: number;
  lastActive: number;
  totalSessions: number;
  favoriteColors: number[];
  preferredQuadrants: { x: number; y: number }[];
  emotionalProgression: EmotionalMemoryEntry[];
  personalityTraits: {
    explorationLevel: number; // 0-1 (conservador vs explorador)
    intensityPreference: number; // 0-1 (calmo vs intenso)
    audioEngagement: number; // 0-1 (baixo vs alto engajamento com áudio)
  };
}

export class EmotionalMemory {
  private storageKey = 'genesis_luminal_memory';
  private currentProfile: EmotionalProfile | null = null;
  private memoryCapacity = 100; // Máximo de entradas por perfil

  constructor() {
    this.loadOrCreateProfile();
  }

  /**
   * Carrega perfil existente ou cria um novo
   */
  private loadOrCreateProfile(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.currentProfile = JSON.parse(stored);
        this.currentProfile!.lastActive = Date.now();
        this.currentProfile!.totalSessions += 1;
        console.log(`Perfil emocional carregado: ${this.currentProfile!.totalSessions} sessões`);
      } else {
        this.createNewProfile();
      }
    } catch (error) {
      console.warn('Erro ao carregar memória emocional, criando novo perfil');
      this.createNewProfile();
    }
  }

  /**
   * Cria um novo perfil emocional
   */
  private createNewProfile(): void {
    this.currentProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
      totalSessions: 1,
      favoriteColors: [],
      preferredQuadrants: [],
      emotionalProgression: [],
      personalityTraits: {
        explorationLevel: 0.5,
        intensityPreference: 0.5,
        audioEngagement: 0.5
      }
    };
    
    console.log(`Novo perfil emocional criado: ${this.currentProfile.id}`);
  }

  /**
   * Registra uma nova experiência emocional
   */
  recordEmotionalState(
    mousePosition: { x: number; y: number },
    intensity: number,
    audioScale: string,
    sessionDuration: number
  ): void {
    if (!this.currentProfile) return;

    const now = new Date();
    const entry: EmotionalMemoryEntry = {
      timestamp: Date.now(),
      emotionalState: {
        mousePosition,
        intensity,
        audioScale,
        sessionDuration
      },
      context: {
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
        season: this.getCurrentSeason()
      },
      preferences: {
        preferredColors: [mousePosition.x * 360], // Converter posição para hue
        preferredIntensity: intensity,
        audioPreference: audioScale
      }
    };

    this.currentProfile.emotionalProgression.push(entry);

    // Manter apenas as últimas entradas para não sobrecarregar
    if (this.currentProfile.emotionalProgression.length > this.memoryCapacity) {
      this.currentProfile.emotionalProgression.shift();
    }

    // Atualizar perfil baseado na nova entrada
    this.updateProfile(entry);
    this.saveProfile();
  }

  /**
   * Atualiza características do perfil baseado na nova experiência
   */
  private updateProfile(entry: EmotionalMemoryEntry): void {
    if (!this.currentProfile) return;

    const { emotionalState, preferences } = entry;

    // Atualizar cores favoritas
    const newHue = preferences.preferredColors[0];
    this.currentProfile.favoriteColors.push(newHue);
    
    // Manter apenas últimas 20 cores e calcular favoritas
    if (this.currentProfile.favoriteColors.length > 20) {
      this.currentProfile.favoriteColors.shift();
    }

    // Atualizar quadrantes preferidos
    this.currentProfile.preferredQuadrants.push(emotionalState.mousePosition);
    if (this.currentProfile.preferredQuadrants.length > 15) {
      this.currentProfile.preferredQuadrants.shift();
    }

    // Atualizar traços de personalidade
    const traits = this.currentProfile.personalityTraits;
    
    // Nível de exploração baseado na variação de posições
    const exploration = this.calculateExplorationLevel();
    traits.explorationLevel = (traits.explorationLevel * 0.8) + (exploration * 0.2);
    
    // Preferência de intensidade
    traits.intensityPreference = (traits.intensityPreference * 0.9) + (emotionalState.intensity * 0.1);
    
    // Engajamento com áudio (será atualizado quando áudio for ativado)
    if (emotionalState.audioScale !== 'none') {
      traits.audioEngagement = Math.min(traits.audioEngagement + 0.1, 1);
    }
  }

  /**
   * Calcula nível de exploração baseado na variação de posições
   */
  private calculateExplorationLevel(): number {
    if (!this.currentProfile || this.currentProfile.preferredQuadrants.length < 2) {
      return 0.5;
    }

    const positions = this.currentProfile.preferredQuadrants.slice(-10); // Últimas 10 posições
    let totalVariation = 0;

    for (let i = 1; i < positions.length; i++) {
      const dist = Math.sqrt(
        Math.pow(positions[i].x - positions[i-1].x, 2) +
        Math.pow(positions[i].y - positions[i-1].y, 2)
      );
      totalVariation += dist;
    }

    return Math.min(totalVariation / positions.length, 1);
  }

  /**
   * Obtém recomendações personalizadas baseadas na memória
   */
  getPersonalizedRecommendations(): {
    suggestedColors: number[];
    suggestedQuadrant: { x: number; y: number };
    suggestedIntensity: number;
    adaptiveSettings: {
      particleCount: number;
      audioVolume: number;
      visualComplexity: number;
    };
  } {
    if (!this.currentProfile || this.currentProfile.emotionalProgression.length === 0) {
      return {
        suggestedColors: [200, 280, 320], // Cores padrão
        suggestedQuadrant: { x: 0.5, y: 0.5 },
        suggestedIntensity: 0.5,
        adaptiveSettings: {
          particleCount: 2000,
          audioVolume: 0.15,
          visualComplexity: 0.8
        }
      };
    }

    const profile = this.currentProfile;
    const traits = profile.personalityTraits;

    // Calcular cores favoritas por frequência
    const colorFrequency = new Map<number, number>();
    profile.favoriteColors.forEach(color => {
      const bucket = Math.floor(color / 30) * 30; // Agrupar por faixas de 30°
      colorFrequency.set(bucket, (colorFrequency.get(bucket) || 0) + 1);
    });

    const suggestedColors = Array.from(colorFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hue]) => hue);

    // Calcular quadrante médio preferido
    const avgQuadrant = profile.preferredQuadrants.reduce(
      (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
      { x: 0, y: 0 }
    );
    avgQuadrant.x /= profile.preferredQuadrants.length;
    avgQuadrant.y /= profile.preferredQuadrants.length;

    // Configurações adaptativas baseadas na personalidade
    const adaptiveSettings = {
      particleCount: Math.floor(1000 + (traits.intensityPreference * 1500)), // 1000-2500
      audioVolume: 0.1 + (traits.audioEngagement * 0.2), // 0.1-0.3
      visualComplexity: 0.5 + (traits.explorationLevel * 0.5) // 0.5-1.0
    };

    return {
      suggestedColors: suggestedColors.length > 0 ? suggestedColors : [200, 280, 320],
      suggestedQuadrant: avgQuadrant,
      suggestedIntensity: traits.intensityPreference,
      adaptiveSettings
    };
  }

  /**
   * Obtém estatísticas do perfil
   */
  getProfileStats(): {
    totalSessions: number;
    daysSinceCreation: number;
    personalityType: string;
    memoryEntries: number;
    explorationScore: number;
  } {
    if (!this.currentProfile) {
      return {
        totalSessions: 0,
        daysSinceCreation: 0,
        personalityType: 'Novo Usuário',
        memoryEntries: 0,
        explorationScore: 0
      };
    }

    const daysSinceCreation = (Date.now() - this.currentProfile.createdAt) / (1000 * 60 * 60 * 24);
    const traits = this.currentProfile.personalityTraits;

    // Determinar tipo de personalidade
    let personalityType = 'Equilibrado';
    if (traits.explorationLevel > 0.7 && traits.intensityPreference > 0.7) {
      personalityType = 'Explorador Intenso';
    } else if (traits.explorationLevel > 0.7) {
      personalityType = 'Explorador Contemplativo';
    } else if (traits.intensityPreference > 0.7) {
      personalityType = 'Contemplador Intenso';
    } else if (traits.explorationLevel < 0.3 && traits.intensityPreference < 0.3) {
      personalityType = 'Minimalista Zen';
    }

    return {
      totalSessions: this.currentProfile.totalSessions,
      daysSinceCreation: Math.floor(daysSinceCreation),
      personalityType,
      memoryEntries: this.currentProfile.emotionalProgression.length,
      explorationScore: Math.floor(traits.explorationLevel * 100)
    };
  }

  /**
   * Salva o perfil no localStorage
   */
  private saveProfile(): void {
    if (!this.currentProfile) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.currentProfile));
    } catch (error) {
      console.warn('Erro ao salvar perfil emocional:', error);
    }
  }

  /**
   * Determina a estação atual
   */
  private getCurrentSeason(): string {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 2 && month <= 4) return 'outono';
    if (month >= 5 && month <= 7) return 'inverno';
    if (month >= 8 && month <= 10) return 'primavera';
    return 'verão';
  }

  /**
   * Limpa toda a memória (para testes ou reset)
   */
  clearMemory(): void {
    localStorage.removeItem(this.storageKey);
    this.createNewProfile();
    console.log('Memória emocional limpa');
  }
}
