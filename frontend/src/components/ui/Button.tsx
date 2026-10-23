'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  external?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      href,
      external = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes: minimum 48px touch target on all buttons
    const baseClasses =
      'inline-flex items-center justify-center font-heading uppercase tracking-wider select-none rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

    // Variant classes
    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-craze-amber text-craze-dark shadow-[0_4px_0_0_#b88225] hover:bg-[#ffc66e] hover:shadow-[0_4px_0_0_#a7741d] active:shadow-none focus-visible:ring-craze-amber',
      secondary:
        'bg-craze-red text-craze-cream shadow-[0_4px_0_0_#8F0A13] hover:bg-[#d81423] hover:shadow-[0_4px_0_0_#75060e] active:shadow-none focus-visible:ring-craze-red',
      outline:
        'bg-transparent border-2 border-craze-dark text-craze-dark shadow-[0_4px_0_0_rgba(43,10,12,0.2)] hover:bg-craze-dark/5 active:shadow-none focus-visible:ring-craze-dark',
      ghost:
        'bg-transparent text-craze-dark hover:bg-craze-dark/10 shadow-none active:translate-y-0 focus-visible:ring-craze-dark',
    };

    // Mobile-first touch-friendly size classes (all at least 48px touch target)
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-base px-4 py-2.5 gap-2 min-h-[48px] min-w-[48px]',
      md: 'text-lg sm:text-xl px-5 py-3 gap-2 min-h-[48px]',
      lg: 'text-xl sm:text-2xl px-6 py-4 gap-2.5 min-h-[56px]',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim();

    const content = (
      <>
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </>
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClasses}
          >
            {content}
          </a>
        );
      }
      return (
        <Link href={href} className={combinedClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
