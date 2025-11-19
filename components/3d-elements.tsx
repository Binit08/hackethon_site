'use client';

import { motion } from 'framer-motion';
import { Code, Cpu, Rocket, Terminal, Zap, Brain, Trophy, Sparkles } from 'lucide-react';

export function Floating3DElements() {
  const icons = [
    { Icon: Code, delay: 0, duration: 8, x: '10%', y: '20%' },
    { Icon: Cpu, delay: 1, duration: 10, x: '80%', y: '15%' },
    { Icon: Rocket, delay: 2, duration: 7, x: '20%', y: '70%' },
    { Icon: Terminal, delay: 3, duration: 9, x: '85%', y: '65%' },
    { Icon: Zap, delay: 1.5, duration: 6, x: '50%', y: '40%' },
    { Icon: Brain, delay: 2.5, duration: 11, x: '30%', y: '50%' },
    { Icon: Trophy, delay: 0.5, duration: 8.5, x: '70%', y: '80%' },
    { Icon: Sparkles, delay: 3.5, duration: 7.5, x: '60%', y: '25%' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ perspective: '1500px' }}>
      {icons.map(({ Icon, delay, duration, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute transform-3d"
          style={{
            left: x,
            top: y,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            y: [0, -40, 0],
            rotateX: [0, 360],
            rotateY: [0, 360],
            rotateZ: [0, 180, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: duration / 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-16 h-16 md:w-24 md:h-24 text-blue-400" />
          </motion.div>
        </motion.div>
      ))}

      {/* Floating 3D Cubes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cube-${i}`}
          className="absolute w-20 h-20 md:w-32 md:h-32 transform-3d"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            rotateZ: [0, 360],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-lg backdrop-blur-sm border border-blue-200/20"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
            }}
          />
        </motion.div>
      ))}

      {/* Rotating Rings */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border-4 border-blue-400/20 transform-3d"
          style={{
            width: `${100 + i * 80}px`,
            height: `${100 + i * 80}px`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [360, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export function Card3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`transform-3d ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{
        rotateY: 5,
        rotateX: 5,
        scale: 1.05,
        z: 50,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}

export function FlipCard3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`transform-3d ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      initial={{ rotateY: -90, opacity: 0 }}
      whileInView={{ rotateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{
        rotateY: 10,
        rotateX: 5,
        scale: 1.05,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}
