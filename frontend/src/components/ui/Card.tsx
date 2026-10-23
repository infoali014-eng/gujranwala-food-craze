'use client';

import React from 'react';

export type CardVariant = 'cream' | 'red' | 'amber' | 'cork' | 'surface';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'cream',
  interactive = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200 relative overflow-hidden';

  const variantClasses: Record<CardVariant, string> = {
    cream: 'bg-craze-cream border-2 border-craze-amber/80 text-craze-dark shadow-sm',
    red: 'bg-craze-red border-2 border-craze-red-dark text-craze-cream shadow-md',
    amber: 'bg-craze-amber border-2 border-[#d99532] text-craze-dark shadow-sm',
    cork: 'bg-[#d8a86a] border-4 border-[#b98444] text-[#2c1a0e] shadow-inner',
    surface: 'bg-white/95 border-2 border-craze-cream text-craze-dark shadow-sm',
  };

  const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const interactiveClasses = interactive
    ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
