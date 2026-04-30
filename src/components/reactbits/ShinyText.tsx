import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        backgroundImage: disabled
          ? 'none'
          : 'linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: disabled ? 'inherit' : 'rgba(255,255,255,0.4)',
        animation: disabled ? 'none' : `shiny-text ${animationDuration} linear infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shiny-text {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
