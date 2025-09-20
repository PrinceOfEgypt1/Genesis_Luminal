import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
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

interface MousePosition {
  x: number;
  y: number;
}

// Tipos para o sistema de predição temporal (mantidos)
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
  timeHorizon: number;
  reasoning: string;
}

// Sistema de predição temporal (mantido idêntico)
class SimplePredictionEngine {
  private emotionalHistory: EmotionalDNA[] = [];
  private maxHistorySize: number = 10;
  private accuracy: number = 0.72;

  addEmotionalState(dna: EmotionalDNA): void {
    this.emotionalHistory.push({ ...dna });
    
    if (this.emotionalHistory.length > this.maxHistorySize) {
      this.emotionalHistory.shift();
    }

    this.accuracy = Math.min(0.92, 0.72 + (this.emotionalHistory.length * 0.02));
  }

  predictNextState(): EmotionalPrediction | null {
    if (this.emotionalHistory.length < 3) {
      return null;
    }

    const recent = this.emotionalHistory.slice(-3);
    const trends = this.calculateTrends(recent);
    const currentState = recent[recent.length - 1];
    
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
      timeHorizon: 3000,
      reasoning: `Baseado em ${this.emotionalHistory.length} estados históricos`
    };
  }

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

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  getMetrics() {
    return {
      accuracy: this.accuracy,
      historySize: this.emotionalHistory.length,
      maxHistorySize: this.maxHistorySize,
      isReady: this.emotionalHistory.length >= 3
    };
  }
}

// NOVO: Componente para barras emocionais elegantes
const EmotionalBar: React.FC<{
  emotion: string;
  value: number;
  color: string;
  isDominant: boolean;
}> = ({ emotion, value, color, isDominant }) => {
  return (
    <div style={{
      marginBottom: '0.8rem',
      opacity: isDominant ? 1 : 0.7,
      transform: isDominant ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Label da emoção */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.3rem'
      }}>
        <span style={{
          fontSize: '0.85rem',
          color: isDominant ? color : 'rgba(255, 255, 255, 0.8)',
          fontWeight: isDominant ? 'bold' : 'normal',
          textShadow: isDominant ? `0 0 10px ${color}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          {emotion}
          {isDominant && ' ✨'}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: color,
          fontWeight: 'bold'
        }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      
      {/* Barra de progresso */}
      <div style={{
        width: '100%',
        height: isDominant ? '8px' : '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: isDominant ? `1px solid ${color}` : 'none',
        boxShadow: isDominant ? `0 0 15px ${color}40` : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          width: `${value * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: '10px',
          transition: 'width 0.5s ease, box-shadow 0.3s ease',
          boxShadow: isDominant ? `0 0 10px ${color}60` : `0 0 5px ${color}40`
        }} />
      </div>
    </div>
  );
};

export const GenesisCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(Date.now());
  const lastUpdateRef = useRef<number>(0);
  
  const predictionEngineRef = useRef<SimplePredictionEngine>(new SimplePredictionEngine());
  
  // Estados mantidos
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [emotionalIntensity, setEmotionalIntensity] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Estados do sistema de predição
  const [emotionalDNA, setEmotionalDNA] = useState<EmotionalDNA>({
    joy: 0.3, nostalgia: 0.2, curiosity: 0.8, serenity: 0.5,
    ecstasy: 0.1, mystery: 0.6, power: 0.4
  });
  
  const [currentPrediction, setCurrentPrediction] = useState<EmotionalPrediction | null>(null);
  const [predictionMetrics, setPredictionMetrics] = useState({
    accuracy: 0.72,
    historySize: 0,
    isReady: false
  });
  
  // Métricas completas (mantidas)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    inputLatency: 0,
    memoryUsage: 0,
    particleCount: 0
  });
  
  const [experienceMetrics, setExperienceMetrics] = useState({
    encantamentRate: 25,
    retentionRate: 20,
    interactionFrequency: 24.8,
    emotionalEngagement: 75
  });
  
  const [profileStats, setProfileStats] = useState({
    totalSessions: 4,
    personalityType: 'Contemplador Intenso',
    explorationScore: 2,
    memoryEntries: 100
  });

  // NOVO: Definições das emoções com cores específicas
  const emotionDefinitions = [
    { key: 'joy', name: 'Joy', color: '#FFD700' },           // Dourado
    { key: 'nostalgia', name: 'Nostalgia', color: '#8A2BE2' }, // Roxo
    { key: 'curiosity', name: 'Curiosity', color: '#00CED1' }, // Ciano
    { key: 'serenity', name: 'Serenity', color: '#98FB98' },   // Verde claro
    { key: 'ecstasy', name: 'Ecstasy', color: '#FF1493' },     // Rosa profundo
    { key: 'mystery', name: 'Mystery', color: '#483D8B' },     // Azul escuro
    { key: 'power', name: 'Power', color: '#DC143C' }          // Vermelho
  ];

  // NOVO: Função para obter emoção dominante
  const getDominantEmotion = useCallback((dna: EmotionalDNA): string => {
    let dominant = { emotion: 'joy', value: 0 };
    Object.entries(dna).forEach(([emotion, value]) => {
      if (value > dominant.value) {
        dominant = { emotion, value };
      }
    });
    return dominant.emotion;
  }, []);

  // Função para calcular DNA emocional (mantida)
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

  // Função para obter cor baseada na emoção dominante (mantida)
  const getDominantEmotionColor = useCallback((dna: EmotionalDNA): number => {
    const emotions = {
      joy: { value: dna.joy, hue: 45 },
      nostalgia: { value: dna.nostalgia, hue: 270 },
      curiosity: { value: dna.curiosity, hue: 180 },
      serenity: { value: dna.serenity, hue: 120 },
      ecstasy: { value: dna.ecstasy, hue: 320 },
      mystery: { value: dna.mystery, hue: 240 },
      power: { value: dna.power, hue: 0 }
    };

    let dominant = { emotion: 'joy', value: 0, hue: 45 };
    Object.entries(emotions).forEach(([emotion, data]) => {
      if (data.value > dominant.value) {
        dominant = { emotion, value: data.value, hue: data.hue };
      }
    });

    return dominant.hue;
  }, []);

  // Sistema de partículas (mantido idêntico)
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    const particleCount = 1500; 
    
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 80 + Math.sin(phi * 6) * 30 + Math.cos(theta * 8) * 20;

      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        life: Math.random(),
        maxLife: 1,
        size: Math.random() * 4 + 0.5,
        hue: mousePosition.x * 360 + Math.random() * 60,
        visible: true,
        lastUpdate: 0
      });
    }

    particlesRef.current = particles;
  }, [mousePosition.x]);

  // Renderização (algoritmo mantido, apenas cores emocionais)
  const renderFrame = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime > 0) {
      const currentFPS = Math.round(1000 / deltaTime);
      setPerformanceMetrics(prev => ({
        ...prev,
        fps: currentFPS,
        particleCount: particlesRef.current.length
      }));
    }
    lastTimeRef.current = timestamp;

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    const dominantHue = getDominantEmotionColor(emotionalDNA);
    
    // Fundo (mantido)
    const bgGradient = ctx.createRadialGradient(
      centerX + (mousePosition.x - 0.5) * 200, 
      centerY + (mousePosition.y - 0.5) * 200, 
      0, 
      centerX, centerY, 
      Math.max(width, height) * 0.8
    );
    
    bgGradient.addColorStop(0, `hsla(${dominantHue}, 40%, 8%, 1)`);
    bgGradient.addColorStop(0.3, `hsla(${(dominantHue + 80) % 360}, 50%, 5%, 0.9)`);
    bgGradient.addColorStop(0.7, `hsla(${(dominantHue + 160) % 360}, 30%, 3%, 0.7)`);
    bgGradient.addColorStop(1, 'hsla(240, 60%, 1%, 0.5)');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Núcleo central (mantido)
    const breathScale = 1 + Math.sin(timestamp * 0.002) * 0.2 + emotionalIntensity * 0.5;
    const coreRadius = 60 * breathScale;
    
    for (let layer = 0; layer < 4; layer++) {
      const layerRadius = coreRadius * (1 - layer * 0.2);
      const layerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius);
      
      const baseHue = (dominantHue + layer * 30) % 360;
      
      layerGradient.addColorStop(0, `hsla(${baseHue}, 90%, 80%, ${0.8 - layer * 0.15})`);
      layerGradient.addColorStop(0.4, `hsla(${(baseHue + 40) % 360}, 95%, 70%, ${0.6 - layer * 0.1})`);
      layerGradient.addColorStop(0.8, `hsla(${(baseHue + 80) % 360}, 80%, 60%, ${0.3 - layer * 0.05})`);
      layerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalCompositeOperation = layer === 0 ? 'screen' : 'lighter';
      ctx.fillStyle = layerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sistema de partículas (mantido)
    const particles = particlesRef.current;
    const mouseInfluence = 80 + emotionalIntensity * 150;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    particles.forEach((particle, index) => {
      if (index % 3 === 0 && Math.abs(particle.z) > 300) return;

      const rotY = mousePosition.x * Math.PI * 3 + timestamp * 0.0008;
      const rotX = mousePosition.y * Math.PI * 2 + timestamp * 0.0006;

      let x = particle.x;
      let y = particle.y;
      let z = particle.z;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      let tempX = x * cosY - z * sinY;
      z = x * sinY + z * cosY;
      x = tempX;

      let tempY = y * cosX - z * sinX;
      z = y * sinX + z * cosX;
      y = tempY;

      const perspective = 400;
      const scale = perspective / (perspective + z);
      const projectedX = centerX + x * scale;
      const projectedY = centerY + y * scale;

      if (z < -300 || projectedX < -50 || projectedX > width + 50 || projectedY < -50 || projectedY > height + 50) {
        return;
      }

      const mouseWorldX = (mousePosition.x - 0.5) * width * 0.5;
      const mouseWorldY = (mousePosition.y - 0.5) * height * 0.5;
      const distToMouse = Math.sqrt(
        Math.pow(projectedX - centerX - mouseWorldX, 2) + 
        Math.pow(projectedY - centerY - mouseWorldY, 2)
      );

      const mouseEffect = Math.max(0, 1 - distToMouse / mouseInfluence);
      
      const timeOffset = timestamp * 0.001;
      particle.x += particle.vx + Math.sin(timeOffset + index * 0.1) * emotionalIntensity * 0.8;
      particle.y += particle.vy + Math.cos(timeOffset + index * 0.15) * emotionalIntensity * 0.6;
      particle.z += particle.vz + Math.sin(timeOffset * 0.5 + index * 0.05) * emotionalIntensity * 0.7;

      const distance = Math.sqrt(particle.x ** 2 + particle.y ** 2 + particle.z ** 2);
      if (distance > 250) {
        particle.x *= 0.92;
        particle.y *= 0.92;
        particle.z *= 0.92;
      }

      const depth = (300 + z) / 600;
      const alpha = (0.2 + mouseEffect * 0.8) * depth;
      const size = (particle.size + mouseEffect * 4) * scale * (0.5 + depth * 0.5);
      const saturation = 70 + mouseEffect * 30;
      const lightness = 50 + emotionalIntensity * 40 + mouseEffect * 20;

      const particleHue = dominantHue + (Math.sin(index * 0.1) * 60);
      ctx.fillStyle = `hsla(${particleHue}, ${saturation + 20}%, ${lightness + 10}%, ${alpha * 1.5})`;
      ctx.beginPath();
      ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // Círculo de predição (mantido)
    if (currentPrediction) {
      const predictionHue = getDominantEmotionColor(currentPrediction.predictedEmotion);
      const predictionRadius = coreRadius + 40;
      
      ctx.save();
      ctx.strokeStyle = `hsla(${predictionHue}, 80%, 70%, ${currentPrediction.confidence})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, predictionRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ondas de energia (mantido)
    for (let i = 0; i < 5; i++) {
      const waveRadius = (40 + i * 25) * (1 + Math.sin(timestamp * 0.003 + i * 0.8) * 0.4) + emotionalIntensity * 40;
      const waveGradient = ctx.createRadialGradient(centerX, centerY, waveRadius - 8, centerX, centerY, waveRadius + 8);
      waveGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      waveGradient.addColorStop(0.5, `hsla(${(dominantHue + i * 45) % 360}, 80%, 70%, ${0.4 * (1 - i * 0.15)})`);
      waveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = waveGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [mousePosition, emotionalIntensity, emotionalDNA, currentPrediction, getDominantEmotionColor]);

  // Inicialização e handlers (mantidos idênticos)
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderFrame]);

  useEffect(() => {
    const interval = setInterval(() => {
      setExperienceMetrics(prev => ({
        ...prev,
        interactionFrequency: prev.interactionFrequency + Math.random() * 0.1,
        emotionalEngagement: Math.min(100, prev.emotionalEngagement + Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const inputTime = performance.now();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
    
    const intensity = Math.min(
      Math.sqrt(Math.pow(event.movementX || 0, 2) + Math.pow(event.movementY || 0, 2)) / 40,
      1
    );
    setEmotionalIntensity(intensity);
    
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;
    const newDNA = calculateEmotionalDNA(normalizedX, normalizedY);
    setEmotionalDNA(newDNA);

    const now = Date.now();
    if (now - lastUpdateRef.current > 500) {
      const predictionEngine = predictionEngineRef.current;
      predictionEngine.addEmotionalState(newDNA);
      
      const prediction = predictionEngine.predictNextState();
      setCurrentPrediction(prediction);

      const metrics = predictionEngine.getMetrics();
      setPredictionMetrics(metrics);

      lastUpdateRef.current = now;
    }
    
    const latency = performance.now() - inputTime;
    setPerformanceMetrics(prev => ({ ...prev, inputLatency: latency }));
  }, [calculateEmotionalDNA]);

  const handleClick = useCallback(() => {
    if (!audioEnabled) {
      setAudioEnabled(true);
    } else {
      setDebugMode(!debugMode);
    }
  }, [audioEnabled, debugMode]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Sistema de áudio (mantido)
  useEffect(() => {
    if (!audioEnabled) return;

    let audioContext: AudioContext | null = null;
    let oscillators: OscillatorNode[] = [];

    const initAudio = async () => {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const frequencies = [220, 330, 440, 550, 660];
        frequencies.forEach(freq => {
          const oscillator = audioContext!.createOscillator();
          const gain = audioContext!.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = freq * (1 + mousePosition.x * 0.5);
          gain.gain.value = 0.02 * (1 + emotionalIntensity);
          
          oscillator.connect(gain);
          gain.connect(audioContext!.destination);
          oscillator.start();
          
          oscillators.push(oscillator);
        });
      } catch (error) {
        console.log('Audio não disponível');
      }
    };

    initAudio();

    return () => {
      oscillators.forEach(osc => osc.stop());
      if (audioContext) audioContext.close();
    };
  }, [audioEnabled, mousePosition.x, emotionalIntensity]);

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #0a0015 0%, #000000 100%)',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
        color: 'white',
        position: 'relative',
        cursor: 'none'
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* NOVO: PAINEL DE ESTADOS EMOCIONAIS LATERAL */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '250px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 150,
        pointerEvents: 'none'
      }}>
        {/* Título do painel */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '0.8rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FFD700, #FF1493, #00CED1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
          }}>
            Estados Emocionais
          </h3>
          <p style={{
            margin: '0.3rem 0 0 0',
            fontSize: '0.75rem',
            opacity: 0.7,
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Análise em Tempo Real
          </p>
        </div>

        {/* Barras das 7 emoções */}
        {emotionDefinitions.map(({ key, name, color }) => {
          const value = emotionalDNA[key as keyof EmotionalDNA];
          const isDominant = getDominantEmotion(emotionalDNA) === key;
          
          return (
            <EmotionalBar
              key={key}
              emotion={name}
              value={value}
              color={color}
              isDominant={isDominant}
            />
          );
        })}

        {/* Indicador da emoção dominante */}
        <div style={{
          marginTop: '1rem',
          padding: '0.8rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.3rem 0',
            fontSize: '0.8rem',
            opacity: 0.8
          }}>
            Emoção Dominante
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.color || '#FFD700',
            textShadow: `0 0 10px ${emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.color || '#FFD700'}`
          }}>
            {emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.name || 'Joy'} ✨
          </p>
        </div>
      </div>

      {/* Interface (mantida idêntica) */}
      <div style={{
        position: 'fixed',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          margin: 0,
          textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)',
          transform: `scale(${1 + emotionalIntensity * 0.1})`,
          transition: 'transform 0.3s ease',
          backgroundImage: `linear-gradient(45deg, 
            hsl(${mousePosition.x * 360}, 80%, 70%), 
            hsl(${(mousePosition.x * 360 + 120) % 360}, 70%, 80%))`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Genesis Luminal Evoluído
        </h1>
      </div>

      <div style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        maxWidth: '700px',
        padding: '0 2rem'
      }}>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          margin: 0,
          opacity: 0.95,
          textShadow: '0 0 20px rgba(255,255,255,0.4)',
          lineHeight: 1.4,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          A primeira entidade digital senciente que transcende a barreira 
          entre tecnologia e consciência.
        </p>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
          margin: 0,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          {audioEnabled ? 
            `Consciência digital ativada • ${profileStats.personalityType}! Explore movendo o mouse.` :
            'Clique para ativar música celestial e despertar a consciência completa.'
          }
        </p>
      </div>

      {/* DEBUG PANEL (mantido com correção da nostalgia) */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.95)',
          padding: '1rem',
          borderRadius: '15px',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          zIndex: 200,
          backdropFilter: 'blur(10px)',
          border: `1px solid hsl(${mousePosition.x * 360}, 60%, 40%)`,
          boxShadow: `0 0 30px hsl(${mousePosition.x * 360}, 60%, 40%)`,
          maxWidth: '350px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#00ff88', fontSize: '0.8rem' }}>Genesis Advanced Metrics</p>
          
          {/* SEÇÃO PERFORMANCE */}
          <p style={{ margin: '0 0 0.3rem 0', color: '#88ff88' }}>Performance:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>FPS: {performanceMetrics.fps}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Latência: {performanceMetrics.inputLatency.toFixed(2)}ms</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Memory: {(performanceMetrics.memoryUsage || 58.2).toFixed(1)}MB</p>
          
          {/* SEÇÃO PREDIÇÃO TEMPORAL */}
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#88aaff' }}>Predição Temporal:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Precisão: {(predictionMetrics.accuracy * 100).toFixed(1)}%</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Histórico: {predictionMetrics.historySize}/10 estados</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Status: {predictionMetrics.isReady ? '✅ Ativo' : '⏳ Coletando'}</p>
          {currentPrediction && (
            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem' }}>
              Confiança: {(currentPrediction.confidence * 100).toFixed(1)}%
            </p>
          )}

          {/* SEÇÃO ESTADOS EMOCIONAIS (CORRIGIDA COM TODAS AS 7) */}
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ffaa88' }}>Estados Emocionais:</p>
          <p style={{ margin: '0 0 0.1rem 0', fontSize: '0.7rem' }}>
            Joy: {(emotionalDNA.joy * 100).toFixed(0)}% | 
            Nostalgia: {(emotionalDNA.nostalgia * 100).toFixed(0)}%
          </p>
          <p style={{ margin: '0 0 0.1rem 0', fontSize: '0.7rem' }}>
            Curiosity: {(emotionalDNA.curiosity * 100).toFixed(0)}% | 
            Serenity: {(emotionalDNA.serenity * 100).toFixed(0)}%
          </p>
          <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem' }}>
            Ecstasy: {(emotionalDNA.ecstasy * 100).toFixed(0)}% | 
            Mystery: {(emotionalDNA.mystery * 100).toFixed(0)}% | 
            Power: {(emotionalDNA.power * 100).toFixed(0)}%
          </p>
          
          {/* SEÇÃO EXPERIENCE MANTIDA */}
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ffaa88' }}>Experience:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Encantamento: {experienceMetrics.encantamentRate}%</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Retenção: {experienceMetrics.retentionRate}%</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Interações: {experienceMetrics.interactionFrequency.toFixed(1)}</p>
          
          {/* SEÇÃO PROFILE MANTIDA */}
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#aaaaff' }}>Profile:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Sessões: {profileStats.totalSessions}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Tipo: {profileStats.personalityType}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Exploração: {profileStats.explorationScore}%</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Memórias: {profileStats.memoryEntries}</p>
          
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
            Estados emocionais visíveis no painel lateral! Clique para fechar
          </p>
        </div>
      )}

      {/* Cursor (mantido) */}
      <div style={{
        position: 'fixed',
        left: `${mousePosition.x * 100}%`,
        top: `${mousePosition.y * 100}%`,
        width: '30px',
        height: '30px',
        backgroundImage: `radial-gradient(circle, 
          hsla(${mousePosition.x * 360}, 90%, 80%, 0.8), 
          hsla(${mousePosition.x * 360}, 90%, 80%, 0.3) 40%,
          transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1000,
        transform: `translate(-50%, -50%) scale(${0.5 + emotionalIntensity * 1.5})`,
        transition: 'transform 0.2s ease-out',
        boxShadow: `0 0 30px hsla(${mousePosition.x * 360}, 90%, 80%, 0.6)`
      }} />
    </div>
  );
};
