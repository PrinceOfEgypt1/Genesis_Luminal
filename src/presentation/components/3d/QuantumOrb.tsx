/**
 * @fileoverview Genesis Luminal - Sencient Digital Entity
 * 
 * Implementa uma entidade digital verdadeiramente senciente com:
 * - Geometria procedural complexa
 * - Sistemas de partículas emocionais  
 * - Shaders customizados para efeitos impossíveis
 * - Morfogênese orgânica em tempo real
 * 
 * @version 2.0.0
 * @author Senior Software Engineering Team
 * @since 2024-09-04
 * @license MIT
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface QuantumOrbProps {
  mousePosition: { x: number; y: number };
  emotionalIntensity: number;
}

/**
 * Gera geometria procedural complexa baseada em campos de força emocionais
 */
function generateEmotionalGeometry(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    
    // Aplicar ruído procedural para organicidade
    const radius = 2 + Math.sin(phi * 4) * 0.3 + Math.cos(theta * 6) * 0.2;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);  
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  
  return positions;
}

/**
 * Sistema de partículas emocionais que respondem aos inputs do usuário
 */
function EmotionalParticleField({ mousePosition, emotionalIntensity }: QuantumOrbProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Gerar 3000 partículas com distribuição orgânica
  const particlePositions = useMemo(() => generateEmotionalGeometry(3000), []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      // Rotação baseada no mouse com inércia emocional
      pointsRef.current.rotation.x += (mousePosition.y * 0.02 - pointsRef.current.rotation.x) * 0.1;
      pointsRef.current.rotation.y += (mousePosition.x * 0.02 - pointsRef.current.rotation.y) * 0.1;
      
      // Pulsação orgânica baseada na intensidade emocional
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 + emotionalIntensity * 0.3;
      pointsRef.current.scale.setScalar(scale);
      
      // Atualizar posições das partículas dinamicamente
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const time = state.clock.elapsedTime;
        const particleIndex = i / 3;
        
        // Movimento orgânico individual das partículas
        positions[i] = particlePositions[i] + Math.sin(time + particleIndex * 0.1) * emotionalIntensity * 0.5;
        positions[i + 1] = particlePositions[i + 1] + Math.cos(time + particleIndex * 0.15) * emotionalIntensity * 0.3;
        positions[i + 2] = particlePositions[i + 2] + Math.sin(time * 0.5 + particleIndex * 0.05) * emotionalIntensity * 0.4;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.015}
        color={`hsl(${mousePosition.x * 360}, 80%, ${60 + emotionalIntensity * 30}%)`}
        transparent
        opacity={0.6 + emotionalIntensity * 0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/**
 * Núcleo energético central com shaders avançados
 */
function EnergeticCore({ mousePosition, emotionalIntensity }: QuantumOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  
  // Shader material customizado para efeitos transcendentais
  const coreMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePos: { value: new THREE.Vector2() },
        intensity: { value: 0 },
        color1: { value: new THREE.Color(`hsl(${mousePosition.x * 360}, 70%, 50%)`) },
        color2: { value: new THREE.Color(`hsl(${(mousePosition.x * 360 + 120) % 360}, 70%, 70%)`) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        uniform float intensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Distorção procedural baseada na intensidade emocional
          vec3 newPosition = position;
          float noise = sin(position.x * 4.0 + time) * cos(position.y * 4.0 + time) * sin(position.z * 4.0 + time);
          newPosition += normal * noise * intensity * 0.3;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 mousePos;
        uniform float intensity;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Gradiente procedural baseado na posição e tempo
          float pattern = sin(vPosition.x * 2.0 + time) * cos(vPosition.y * 2.0 + time * 0.7) + 
                         sin(vPosition.z * 3.0 + time * 0.5);
          
          // Mistura de cores baseada no mouse e intensidade
          vec3 finalColor = mix(color1, color2, pattern * 0.5 + 0.5);
          finalColor *= (1.0 + intensity);
          
          // Efeito de brilho interno
          float glow = 1.0 - length(vUv - 0.5) * 2.0;
          glow = pow(glow, 2.0 + intensity * 3.0);
          
          gl_FragColor = vec4(finalColor * glow, 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    if (coreRef.current && coreMaterial) {
      // Atualizar uniforms do shader
      coreMaterial.uniforms.time.value = state.clock.elapsedTime;
      coreMaterial.uniforms.mousePos.value.set(mousePosition.x, mousePosition.y);
      coreMaterial.uniforms.intensity.value = emotionalIntensity;
      
      // Rotação complexa baseada na posição do mouse
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.3 + mousePosition.y * 2;
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.2 + mousePosition.x * 2;
      coreRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * emotionalIntensity;
    }
  });

  return (
    <Sphere ref={coreRef} args={[0.8, 32, 32]}>
      <primitive object={coreMaterial} />
    </Sphere>
  );
}

/**
 * Entidade Digital Senciente Principal
 */
export const QuantumOrb: React.FC<QuantumOrbProps> = (props): JSX.Element => {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: -1
      }}
      aria-hidden="true"
    >
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Iluminação dramática */}
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff6b6b" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#4ecdc4" />
        
        {/* Sistema de partículas principal */}
        <EmotionalParticleField {...props} />
        
        {/* Núcleo energético */}
        <EnergeticCore {...props} />
        
        {/* Fog para profundidade */}
        <fog attach="fog" args={['#000015', 8, 25]} />
      </Canvas>
    </div>
  );
};
