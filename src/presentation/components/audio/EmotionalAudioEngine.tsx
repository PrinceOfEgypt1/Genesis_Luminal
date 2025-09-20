import React, { useEffect, useRef } from 'react';

interface EmotionalAudioEngineProps {
  mousePosition: { x: number; y: number };
  emotionalIntensity: number;
  isActive: boolean;
}

export const EmotionalAudioEngine: React.FC<EmotionalAudioEngineProps> = ({
  mousePosition,
  emotionalIntensity,
  isActive
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const initAudio = async () => {
      try {
        // @ts-ignore
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioContextRef.current;

        // Criar filtro
        filterRef.current = ctx.createBiquadFilter();
        filterRef.current.type = 'lowpass';
        filterRef.current.frequency.value = 800;

        // Criar reverb simples
        reverbRef.current = ctx.createConvolver();
        const impulseBuffer = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
        for (let channel = 0; channel < impulseBuffer.numberOfChannels; channel++) {
          const channelData = impulseBuffer.getChannelData(channel);
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
          }
        }
        reverbRef.current.buffer = impulseBuffer;

        // Criar osciladores harmônicos
        const frequencies = [220, 330, 440, 550, 660]; // Escala celestial
        
        frequencies.forEach((freq, index) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          
          oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
          oscillator.frequency.value = freq;
          gain.gain.value = 0.02;
          
          oscillator.connect(gain);
          gain.connect(filterRef.current!);
          filterRef.current!.connect(reverbRef.current!);
          reverbRef.current!.connect(ctx.destination);
          
          oscillator.start();
          
          oscillatorsRef.current.push(oscillator);
          gainsRef.current.push(gain);
        });

        console.log('🎵 Sistema de áudio celestial inicializado');
      } catch (error) {
        console.log('🎵 Audio not available:', error);
      }
    };

    initAudio();

    return () => {
      try {
        oscillatorsRef.current.forEach(osc => osc.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        oscillatorsRef.current = [];
        gainsRef.current = [];
      } catch (error) {
        console.log('🎵 Audio cleanup error');
      }
    };
  }, [isActive]);

  // Atualizar parâmetros de áudio baseado no mouse e intensidade
  useEffect(() => {
    if (!audioContextRef.current || !filterRef.current) return;

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime;

    // Atualizar frequências dos osciladores baseado na posição X do mouse
    oscillatorsRef.current.forEach((osc, index) => {
      const baseFreq = [220, 330, 440, 550, 660][index];
      const newFreq = baseFreq * (1 + mousePosition.x * 0.5);
      osc.frequency.setTargetAtTime(newFreq, currentTime, 0.1);
    });

    // Atualizar volumes baseado na intensidade emocional
    gainsRef.current.forEach((gain, index) => {
      const baseVolume = 0.02;
      const newVolume = baseVolume * (1 + emotionalIntensity * 2) * (1 - index * 0.1);
      gain.gain.setTargetAtTime(newVolume, currentTime, 0.1);
    });

    // Atualizar filtro baseado na posição Y do mouse
    const filterFreq = 400 + mousePosition.y * 1200;
    filterRef.current.frequency.setTargetAtTime(filterFreq, currentTime, 0.1);

  }, [mousePosition, emotionalIntensity]);

  return null;
};
