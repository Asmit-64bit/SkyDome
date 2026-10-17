import React from 'react';
import { QuestPriority, MinionCategory } from '../../lib/types';

export interface PixelBadgeProps {
  priority?: QuestPriority;
  category?: MinionCategory;
  variant?: 'solid' | 'outline' | 'pill';
  children?: React.ReactNode;
  className?: string;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  priority,
  category,
  variant = 'solid',
  children,
  className = '',
}) => {
  // Muted tones, strictly , NO purple
  const priorityStyles: Record<QuestPriority, { bg: string; border: string; text: string; label: string }> = {
    common: {
      bg: 'bg-[#EAEBED]',
      border: 'border-[#8A8D91]',
      text: 'text-[#4B4E52]',
      label: 'COMMON',
    },
    uncommon: {
      bg: 'bg-[#EAF3E6]',
      border: 'border-[#5FA244]',
      text: 'text-[#326122]',
      label: 'UNCOMMON',
    },
    rare: {
      bg: 'bg-[#E7F4F7]',
      border: 'border-[#4AA3B5]',
      text: 'text-[#246370]',
      label: 'RARE',
    },
    epic: {
      bg: 'bg-[#FAF4E5]',
      border: 'border-[#E3B341]',
      text: 'text-[#875F0E]',
      label: 'EPIC',
    },
    legendary: {
      bg: 'bg-[#F9ECEB]',
      border: 'border-[#B3392F]',
      text: 'text-[#8F261E]',
      label: 'LEGENDARY',
    },
  };

  const categoryStyles: Record<MinionCategory, { bg: string; border: string; text: string }> = {
    farming: { bg: 'bg-[#EAF3E6]', border: 'border-[#5FA244]', text: 'text-[#326122]' },
    mining: { bg: 'bg-[#EAEBED]', border: 'border-[#8A8D91]', text: 'text-[#4B4E52]' },
    combat: { bg: 'bg-[#F9ECEB]', border: 'border-[#B3392F]', text: 'text-[#8F261E]' },
    foraging: { bg: 'bg-[#F5EDE2]', border: 'border-[#B98E55]', text: 'text-[#6B4A2B]' },
    fishing: { bg: 'bg-[#E7F4F7]', border: 'border-[#4AA3B5]', text: 'text-[#246370]' },
  };

  if (priority) {
    const config = priorityStyles[priority];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-wider border rounded-xs font-sans uppercase ${config.bg} ${config.border} ${config.text} ${className}`}
      >
        {children || config.label}
      </span>
    );
  }

  if (category) {
    const config = categoryStyles[category];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-wider border rounded-xs font-sans uppercase ${config.bg} ${config.border} ${config.text} ${className}`}
      >
        {children || category}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-wider bg-[#EFE6D2] border border-[#CDBE9F] text-[#42362B] rounded-xs font-sans uppercase ${className}`}
    >
      {children}
    </span>
  );
};
