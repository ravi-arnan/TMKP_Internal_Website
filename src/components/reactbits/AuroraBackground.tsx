import React from 'react';
import { motion } from 'motion/react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function AuroraBackground({ children, className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`relative w-full h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradients */}
        <motion.div
          animate={{
            transform: [
              'translate(0%, 0%) scale(1)',
              'translate(-10%, 10%) scale(1.1)',
              'translate(10%, -10%) scale(0.9)',
              'translate(0%, 0%) scale(1)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[10px] opacity-40 mix-blend-screen will-change-transform"
        >
          <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vh] bg-emerald-600/40 rounded-full blur-[100px] animate-blob" />
          <div className="absolute top-[30%] right-[10%] w-[50vw] h-[50vh] bg-teal-600/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[10%] left-[30%] w-[70vw] h-[70vh] bg-green-500/30 rounded-full blur-[130px] animate-blob animation-delay-4000" />
        </motion.div>
        
        {/* Optional overlay for extra texture/noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
