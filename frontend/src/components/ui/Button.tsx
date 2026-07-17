'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'purple' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  
  // Base classes for consistent premium aesthetics and touch targets
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.98] outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] px-5 py-2.5 text-sm shadow-sm';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/95 focus:ring-primary/50 shadow-primary/10 border border-transparent',
    secondary: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 focus:ring-slate-300 border border-transparent',
    outline: 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-primary/20',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-200 shadow-none border border-transparent',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-600/95 focus:ring-emerald-500/50 shadow-emerald-600/10 border border-transparent',
    purple: 'bg-purple-600 text-white hover:bg-purple-600/95 focus:ring-purple-500/50 shadow-purple-600/10 border border-transparent',
    danger: 'bg-danger text-white hover:bg-danger/95 focus:ring-danger/50 shadow-danger/10 border border-transparent'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
