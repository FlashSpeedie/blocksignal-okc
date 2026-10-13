'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-civic-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-civic-600 text-white hover:bg-civic-700 active:bg-civic-800 shadow-card',
      secondary: 'bg-civic-100 text-civic-900 hover:bg-civic-200 active:bg-civic-300',
      outline: 'border-2 border-civic-600 text-civic-600 hover:bg-civic-50 active:bg-civic-100',
      ghost: 'text-civic-600 hover:bg-civic-100 active:bg-civic-200',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-card',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-base gap-2 rounded-xl',
      lg: 'px-6 py-3 text-lg gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';