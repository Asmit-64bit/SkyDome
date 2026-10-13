import React from 'react';

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'stone' | 'wood' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'stone',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'pixel-btn-primary',
    stone: 'pixel-btn-stone',
    wood: 'pixel-btn-wood',
    danger: 'pixel-btn-danger',
    ghost: 'pixel-btn-ghost',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 min-h-[28px]',
    md: 'text-sm px-3.5 py-1.5 min-h-[36px]',
    lg: 'text-base px-5 py-2.5 min-h-[44px]',
  };

  return (
    <button
      className={`pixel-btn ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed filter-none active:transform-none' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
