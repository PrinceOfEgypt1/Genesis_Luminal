import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export const useEmotionalAudio = (
  emotionalIntensity: number,
  mousePosition: { x: number; y: number }
) => {
  const synthRef = useRef<Tone.Synth | null>(null);
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  useEffect(() => {
    // Inicializar sintetizador
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.5 }
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const startAudio = async () => {
    if (!isAudioStarted) {
      await Tone.start();
      setIsAudioStarted(true);
    }
  };

  const playEmotionalTone = () => {
    if (synthRef.current && isAudioStarted && emotionalIntensity > 0.3) {
      // Frequência baseada na posição Y do mouse
      const frequency = 200 + (mousePosition.y * 400);
      // Volume baseado na intensidade emocional
      const volume = -20 + (emotionalIntensity * 15);
      
      synthRef.current.volume.value = volume;
      synthRef.current.triggerAttackRelease(frequency, '8n');
    }
  };

  return { startAudio, playEmotionalTone, isAudioStarted };
};
