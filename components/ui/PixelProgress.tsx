import React from 'react';

export interface PixelProgressProps {
  value: number;
  max: number;
  variant?: 'xp' | 'gold' | 'stone' | 'danger';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max,
  variant = 'xp',
  showLabel = true,
  label,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColors = {
    xp: 'bg-[#5FA244] border-t border-[#7EC461]',
    gold: 'bg-[#E3B341] border-t border-[#FBE186]',
    stone: 'bg-[#8A8D91] border-t border-[#C7C9CC]',
    danger: 'bg-[#B3392F] border-t border-[#D95D52]',
  };

  const heightClasses = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-sans font-semibold mb-1 text-[#2B2118]">
          <span>{label || 'PROGRESS'}</span>
          <span className="font-semibold font-number">
            {value} / {max} XP ({percentage}%)
          </span>
        </div>
      )}
      {/* Container with inset bevel */}
      <div
        className={`w-full ${heightClasses[size]} bg-[#2A2B2D] border-t-2 border-l-2 border-[#18191A] border-r-2 border-b-2 border-[#454749] p-0.5 relative overflow-hidden`}
      >
        {/* Fill */}
        <div
          className={`h-full ${barColors[variant]} transition-all duration-300 relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle pixel highlight strip */}
          <div className="absolute inset-0 bg-white/10 h-1/2 w-full" />
        </div>
      </div>
    </div>
  );
};
