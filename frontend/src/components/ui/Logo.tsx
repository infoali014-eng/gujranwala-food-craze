'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Steam } from './Steam';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSteam?: boolean;
  className?: string;
  interactive?: boolean;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSteam = true,
  className = '',
  interactive = true,
  priority = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const sizeMap = {
    sm: { dimension: 64, steamStrands: 2, steamOffset: -14 },
    md: { dimension: 112, steamStrands: 3, steamOffset: -22 },
    lg: { dimension: 160, steamStrands: 4, steamOffset: -28 },
    xl: { dimension: 220, steamStrands: 5, steamOffset: -36 },
  };

  const { dimension, steamStrands, steamOffset } = sizeMap[size];

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Animated steam wisps rising directly out of the karahi */}
      {showSteam && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ top: `${steamOffset}px` }}
        >
          <Steam strands={isHovered ? steamStrands + 1 : steamStrands} color="#FDEFDA" />
        </div>
      )}

      {/* Flame ambient glow behind the logo that flickers on hover */}
      {interactive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none -z-10"
          animate={
            isHovered
              ? {
                  scale: [1, 1.15, 1.08, 1.18, 1],
                  opacity: [0.5, 0.9, 0.7, 0.95, 0.6],
                  filter: [
                    'blur(14px) drop-shadow(0 0 10px #FDBC5A)',
                    'blur(18px) drop-shadow(0 0 20px #C30D1A)',
                    'blur(15px) drop-shadow(0 0 16px #FDBC5A)',
                  ],
                }
              : { scale: 1, opacity: 0 }
          }
          transition={{
            duration: 0.6,
            repeat: isHovered ? Infinity : 0,
            repeatType: 'reverse',
          }}
          style={{
            background: 'radial-gradient(circle, #FDBC5A 20%, #C30D1A 70%, transparent 90%)',
          }}
        />
      )}

      {/* Circular Logo Emblem without text */}
      <motion.div
        className="relative rounded-full overflow-hidden shadow-xl border-2 border-craze-amber/80 bg-[#C30D1A]"
        style={{ width: dimension, height: dimension }}
        whileHover={
          interactive && !shouldReduceMotion
            ? {
                scale: 1.05,
                rotate: [0, -1.5, 1.5, 0],
                boxShadow:
                  '0 12px 28px rgba(195, 13, 26, 0.6), 0 0 18px rgba(253, 188, 90, 0.8)',
              }
            : undefined
        }
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      >
        <Image
          src="/logo.png"
          alt="Gujranwala Food Craze logo"
          width={dimension}
          height={dimension}
          className="object-cover w-full h-full"
          priority={priority || size === 'xl' || size === 'lg'}
          unoptimized={true}
        />
      </motion.div>
    </div>
  );
};
