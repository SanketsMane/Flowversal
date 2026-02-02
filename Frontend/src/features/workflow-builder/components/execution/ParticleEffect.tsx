/**
 * Particle Effect Component
 * Celebratory particles for success/error states
 */

import React from 'react';
import { useTheme } from '../../../../components/ThemeContext';

interface ParticleEffectProps {
  type: 'success' | 'error';
  trigger: boolean;
  onComplete?: () => void;
}

export function ParticleEffect({ type, trigger, onComplete }: ParticleEffectProps) {
  const { theme } = useTheme();
  const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number; rotation: number }>>([]);

  React.useEffect(() => {
    if (!trigger) return;

    // Generate particles
    const newParticles = Array.from({ length: type === 'success' ? 12 : 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);

    // Clear particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger, type, onComplete]);

  if (particles.length === 0) return null;

  const color = type === 'success' 
    ? (theme === 'dark' ? '#34D399' : '#10B981')
    : (theme === 'dark' ? '#FCA5A5' : '#EF4444');

  const shapes = type === 'success' 
    ? ['●', '★', '✓', '◆']
    : ['✕', '!', '⚠', '●'];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            color,
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: 0,
            animation: 'success-particle 1s ease-out forwards',
            // @ts-ignore - CSS custom properties
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        >
          {shapes[particle.id % shapes.length]}
        </div>
      ))}
    </div>
  );
}
