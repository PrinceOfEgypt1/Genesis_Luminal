export interface EmotionalVector {
  joy: number
  nostalgia: number
  curiosity: number
  serenity: number
  ecstasy: number
  mystery: number
  power: number
}

export interface EmotionalDNA extends EmotionalVector {
  intensity: number
  complexity: number
  stability: number
  timestamp: number
}

export interface EmotionalPrediction {
  predictedEmotion: EmotionalVector
  confidence: number
  timeHorizon: number
  timestamp: number
}

export interface EmotionalHistory {
  sessions: EmotionalSession[]
  patterns: EmotionalPattern[]
  archetypes: EmotionalArchetype[]
}

export interface EmotionalSession {
  id: string
  startTime: number
  endTime: number
  emotionalPath: EmotionalDNA[]
  peakIntensity: number
  averageStability: number
}

export interface EmotionalPattern {
  id: string
  sequence: EmotionalDNA[]
  frequency: number
  uniqueness: number
  emotionalSignature: EmotionalVector
}

export interface EmotionalArchetype {
  id: string
  centroid: EmotionalVector
  members: EmotionalDNA[]
  frequency: number
  stability: number
  uniqueness: number
}
