import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * 🔮 GENESIS LUMINAL - SISTEMA DE PREDIÇÃO TEMPORAL
 * 
 * Implementação focada do sistema de predição temporal
 * Versão: 1.0.0 - Predição Simples
 * 
 * Funcionalidade implementada:
 * - Sistema de predição básico que analisa padrões de movimento do mouse
 * - Buffers de histórico emocional
 * - Predição simples baseada em tendências
 * - Interface visual para mostrar predições
 */

// ===== TIPOS BÁSICOS =====

interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number; // em milissegundos
  reasoning: string;
}

// ===== SISTEMA DE PREDIÇÃO TEMPORAL =====

/**
 * Sistema simples de predição baseado em histórico de estados emocionais
 */
class SimplePredictionEngine {
  private emotionalHistory: EmotionalDNA[] = [];
  private maxHistorySize: number = 10;
  private accuracy: number = 0.7; // Começar com 70%

  /**
   * Adiciona novo estado emocional ao histórico
   */
  addEmotionalState(dna: EmotionalDNA): void {
    this.emotionalHistory.push({ ...dna });
    
    if (this.emotionalHistory.length > this.maxHistorySize) {
      this.emotionalHistory.shift();
    }

    // Melhorar accuracy baseado na quantidade de dados
    this.accuracy = Math.min(0.95, 0.7 + (this.emotionalHistory.length * 0.025));
  }

  /**
   * Prediz próximo estado emocional baseado em tendências
   */
  predictNextState(): EmotionalPrediction | null {
    if (this.emotionalHistory.length < 3) {
      return null;
    }

    const recent = this.emotionalHistory.slice(-3);
    const trends = this.calculateTrends(recent);
    const currentState = recent[recent.length - 1];
    
    // Aplicar tendências ao estado atual
    const predictedEmotion: EmotionalDNA = {
      joy: this.clamp(currentState.joy + trends.joy),
      nostalgia: this.clamp(currentState.nostalgia + trends.nostalgia),
      curiosity: this.clamp(currentState.curiosity + trends.curiosity),
      serenity: this.clamp(currentState.serenity + trends.serenity),
      ecstasy: this.clamp(currentState.ecstasy + trends.ecstasy),
      mystery: this.clamp(currentState.mystery + trends.mystery),
      power: this.clamp(currentState.power + trends.power)
    };

    return {
      predictedEmotion,
      confidence: this.accuracy,
      timeHorizon: 3000, // 3 segundos
      reasoning: `Baseado em ${this.emotionalHistory.length} estados históricos. Tendência detectada.`
    };
  }

  /**
   * Calcula tendências entre estados recentes
   */
  private calculateTrends(states: EmotionalDNA[]): EmotionalDNA {
    if (states.length < 2) {
      return { joy: 0, nostalgia: 0, curiosity: 0, serenity: 0, ecstasy: 0, mystery: 0, power: 0 };
    }

    const first = states[0];
    const last = states[states.length - 1];
    const steps = states.length - 1;

    return {
      joy: (last.joy - first.joy) / steps,
      nostalgia: (last.nostalgia - first.nostalgia) / steps,
      curiosity: (last.curiosity - first.curiosity) / steps,
      serenity: (last.serenity - first.serenity) / steps,
      ecstasy: (last.ecstasy - first.ecstasy) / steps,
      mystery: (last.mystery - first.mystery) / steps,
      power: (last.power - first.power) / steps
    };
  }

  /**
   * Garante que valores fiquem entre 0 e 1
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Obtém métricas do sistema
   */
  getMetrics() {
    return {
      accuracy: this.accuracy,
      historySize: this.emotionalHistory.length,
      maxHistorySize: this.maxHistorySize,
      isReady: this.emotionalHistory.length >= 3
    };
  }
}

// ===== COMPONENTE PRINCIPAL =====

const GenesisLuminalPrediction: React.FC = () => {
  // Estados básicos
  const [emotionalDNA, setEmotionalDNA] = useState<EmotionalDNA>({
    joy: 0.3, nostalgia: 0.2, curiosity: 0.8, serenity: 0.5,
    ecstasy: 0.1, mystery: 0.6, power: 0.4
  });

  const [currentPrediction, setCurrentPrediction] = useState<EmotionalPrediction | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [predictionMetrics, setPredictionMetrics] = useState({
    accuracy: 0.7,
    historySize: 0,
    isReady: false
  });

  // Refs
  const predictionEngineRef = useRef<SimplePredictionEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUpdateRef = useRef<number>(0);

  // Inicialização
  useEffect(() => {
    predictionEngineRef.current = new SimplePredictionEngine();
    console.log('🔮 Sistema de Predição Temporal inicializado');
  }, []);

  // Função para calcular DNA emocional baseado na posição do mouse
  const calculateEmotionalDNA = useCallback((x: number, y: number): EmotionalDNA => {
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    
    return {
      joy: Math.max(0, Math.min(1, (1 - distance) * 0.8 + 0.2)),
      nostalgia: Math.max(0, Math.min(1, (Math.sin(angle) + 1) * 0.5)),
      curiosity: Math.max(0, Math.min(1, distance)),
      serenity: Math.max(0, Math.min(1, (Math.cos(angle * 2) + 1) * 0.5)),
      ecstasy: Math.max(0, Math.min(1, Math.max(0, distance - 0.5) * 2)),
      mystery: Math.max(0, Math.min(1, (Math.sin(angle * 3) + 1) * 0.5)),
      power: Math.max(0, Math.min(1, Math.abs(x) + Math.abs(y)))
    };
  }, []);

  // Handler de movimento do mouse
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !predictionEngineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x: x * 400, y: y * 400 });

    const newDNA = calculateEmotionalDNA(x, y);
    setEmotionalDNA(newDNA);

    // Atualizar sistema de predição a cada 500ms
    const now = Date.now();
    if (now - lastUpdateRef.current > 500) {
      predictionEngineRef.current.addEmotionalState(newDNA);
      
      const prediction = predictionEngineRef.current.predictNextState();
      setCurrentPrediction(prediction);

      const metrics = predictionEngineRef.current.getMetrics();
      setPredictionMetrics(metrics);

      lastUpdateRef.current = now;

      if (prediction) {
        console.log(`🔮 Predição: ${prediction.reasoning} (${(prediction.confidence * 100).toFixed(1)}% confiança)`);
      }
    }
  }, [calculateEmotionalDNA]);

  // Renderização simples de partículas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Limpar canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar núcleo central
      const centerX = canvas.width / 2 + mousePosition.x * 0.1;
      const centerY = canvas.height / 2 + mousePosition.y * 0.1;
      
      // Cor baseada na emoção dominante
      const dominantEmotion = Object.entries(emotionalDNA).reduce((max, [emotion, value]) => 
        value > emotionalDNA[max as keyof EmotionalDNA] ? emotion : max, 'joy'
      );

      const colors = {
        joy: '#FFD700',
        nostalgia: '#8A2BE2',
        curiosity: '#00CED1',
        serenity: '#98FB98',
        ecstasy: '#FF1493',
        mystery: '#2F4F4F',
        power: '#DC143C'
      };

      const color = colors[dominantEmotion as keyof typeof colors] || '#FFD700';
      
      // Núcleo pulsante
      const radius = 20 + Math.sin(Date.now() * 0.005) * 10;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, color + 'AA');
      gradient.addColorStop(1, color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar predição se disponível
      if (currentPrediction) {
        const predDominant = Object.entries(currentPrediction.predictedEmotion).reduce((max, [emotion, value]) => 
          value > currentPrediction.predictedEmotion[max as keyof EmotionalDNA] ? emotion : max, 'joy'
        );
        const predColor = colors[predDominant as keyof typeof colors] || '#FFD700';
        
        // Círculo de predição
        ctx.strokeStyle = predColor + '80';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(animate);
    };

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    animate();
  }, [mousePosition, emotionalDNA, currentPrediction]);

  // Interface de debug
  const DebugPanel = useMemo(() => (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff88',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Monaco, monospace',
      fontSize: '12px',
      lineHeight: '1.5',
      border: '2px solid rgba(0, 255, 136, 0.5)',
      backdropFilter: 'blur(10px)',
      maxWidth: '350px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#00ff88' }}>
        🔮 SISTEMA DE PREDIÇÃO TEMPORAL
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>📊 MÉTRICAS DO SISTEMA:</strong><br/>
        Precisão: {(predictionMetrics.accuracy * 100).toFixed(1)}%<br/>
        Histórico: {predictionMetrics.historySize}/10 estados<br/>
        Status: {predictionMetrics.isReady ? '✅ Pronto' : '⏳ Coletando dados'}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>🎭 ESTADO ATUAL:</strong><br/>
        {Object.entries(emotionalDNA).map(([emotion, value]) => (
          <div key={emotion}>
            {emotion}: {(value * 100).toFixed(0)}%
          </div>
        ))}
      </div>

      {currentPrediction && (
        <div style={{ marginBottom: '15px' }}>
          <strong>🔮 PREDIÇÃO (3s):</strong><br/>
          Confiança: {(currentPrediction.confidence * 100).toFixed(1)}%<br/>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '5px' }}>
            {currentPrediction.reasoning}
          </div>
          <div style={{ marginTop: '10px' }}>
            <strong>Estado Previsto:</strong><br/>
            {Object.entries(currentPrediction.predictedEmotion).map(([emotion, value]) => (
              <div key={emotion} style={{ fontSize: '10px' }}>
                {emotion}: {(value * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '10px', opacity: 0.7, borderTop: '1px solid rgba(0, 255, 136, 0.3)', paddingTop: '10px' }}>
        💡 Mova o mouse para gerar dados emocionais.<br/>
        O sistema aprende seus padrões e prediz próximos estados.
      </div>
    </div>
  ), [emotionalDNA, currentPrediction, predictionMetrics]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
      cursor: 'crosshair'
    }}>
      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />

      {/* Painel de debug */}
      {DebugPanel}

      {/* Instruções */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '250px'
      }}>
        <strong>🎮 COMO USAR:</strong><br/>
        • Mova o mouse para gerar estados emocionais<br/>
        • O sistema aprende seus padrões<br/>
        • Predições aparecem após 3+ estados<br/>
        • Círculo tracejado = estado previsto
      </div>

      <style>
        {`
          body { margin: 0; padding: 0; overflow: hidden; }
          * { box-sizing: border-box; }
        `}
      </style>
    </div>
  );
};

export default GenesisLuminalPrediction;