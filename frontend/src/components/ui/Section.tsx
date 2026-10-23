'use client';

import React from 'react';

export type SectionBg = 'red' | 'cream' | 'dark' | 'cork' | 'amber' | 'transparent';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  bg?: SectionBg;
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  id,
  bg = 'cream',
  badge,
  title,
  subtitle,
  align = 'center',
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const bgClasses: Record<SectionBg, string> = {
    red: 'bg-gradient-to-b from-craze-red to-craze-red-dark text-craze-cream',
    cream: 'bg-craze-cream text-craze-dark',
    dark: 'bg-craze-dark text-craze-cream',
    cork: 'bg-[#d8a86a] text-craze-dark',
    amber: 'bg-craze-amber text-craze-dark',
    transparent: 'bg-transparent',
  };

  const isLight = bg === 'cream' || bg === 'amber' || bg === 'cork';

  return (
    <section
      id={id}
      className={`py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden ${bgClasses[bg]} ${className}`}
      {...props}
    >
      <div className={`max-w-5xl mx-auto ${containerClassName}`}>
        {(badge || title || subtitle) && (
          <div
            className={`mb-8 sm:mb-12 ${
              align === 'center' ? 'text-center items-center' : 'text-left items-start'
            } flex flex-col`}
          >
            {badge && (
              <span
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-widest mb-3 shadow-sm ${
                  isLight
                    ? 'bg-craze-red text-craze-cream'
                    : 'bg-craze-amber text-craze-dark'
                }`}
              >
                {badge}
              </span>
            )}
            {title && (
              <h2
                className={`font-heading text-4xl sm:text-5xl md:text-6xl tracking-wide uppercase leading-tight ${
                  isLight ? 'text-craze-red' : 'text-craze-amber'
                }`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-2 font-serif italic text-base sm:text-lg max-w-xl ${
                  isLight ? 'text-craze-dark/80' : 'text-craze-cream/85'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
