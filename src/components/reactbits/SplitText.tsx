import React from 'react';
import { motion, Variants } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animation?: Variants;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export function SplitText({
  text,
  className = '',
  delay = 50,
  animation,
  textAlign = 'center'
}: SplitTextProps) {
  const words = text.split(' ').map(word => word + '\u00A0');

  const defaultAnimation: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * (delay / 1000),
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }),
  };

  const selectedAnimation = animation || defaultAnimation;

  return (
    <div style={{ textAlign }} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            custom={i}
            variants={selectedAnimation}
            initial="hidden"
            animate="visible"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
