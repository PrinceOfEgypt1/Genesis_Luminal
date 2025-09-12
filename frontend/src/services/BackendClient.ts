export interface EmotionalAnalysisRequest {
  currentState: any;
  mousePosition: { x: number; y: number };
  sessionDuration: number;
}

export interface EmotionalAnalysisResponse {
  success: boolean;
  confidence: number;
  recommendation: string;
  emotionalShift?: string;
  morphogenicSuggestion?: string;
  error?: any;
}

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  error?: any;
}

export class BackendClient {
  private baseUrl: string;
  private lastHealthCheck: number = 0;
  private healthCheckCache: HealthCheckResponse | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
  private readonly REQUEST_TIMEOUT = 5000; // 5 segundos

  constructor() {
    this.baseUrl = 'http://localhost:3001';
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    const now = Date.now();
    
    // 🔧 THROTTLING: Só fazer health check a cada 30 segundos
    if (this.healthCheckCache && (now - this.lastHealthCheck) < this.HEALTH_CHECK_INTERVAL) {
      return this.healthCheckCache;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      const result: HealthCheckResponse = { 
        success: response.ok, 
        status: data.status || 'unknown' 
      };
      
      // Cache do resultado
      this.healthCheckCache = result;
      this.lastHealthCheck = now;
      
      return result;
    } catch (error) {
      const result: HealthCheckResponse = { 
        success: false, 
        status: 'offline', 
        error 
      };
      
      // Cache do erro também para evitar spam
      this.healthCheckCache = result;
      this.lastHealthCheck = now;
      
      return result;
    }
  }

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(`${this.baseUrl}/api/emotional/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotionalState: request.currentState,
          mousePosition: request.mousePosition,
          sessionDuration: request.sessionDuration,
          timestamp: Date.now()
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          confidence: data.confidence || 0.5,
          recommendation: data.recommendation || 'fibonacci',
          emotionalShift: data.emotionalShift || 'stable',
          morphogenicSuggestion: data.morphogenicSuggestion || 'fibonacci'
        };
      } else {
        return {
          success: false,
          confidence: 0.5,
          recommendation: 'fibonacci',
          error: data
        };
      }
    } catch (error) {
      return {
        success: false,
        confidence: 0.5,
        recommendation: 'fibonacci',
        error
      };
    }
  }

  // Método para limpar cache se necessário
  clearHealthCheckCache(): void {
    this.healthCheckCache = null;
    this.lastHealthCheck = 0;
  }
}
