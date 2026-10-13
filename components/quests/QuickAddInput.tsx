'use client';

import React, { useState } from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { parseNaturalLanguageQuest } from '../../lib/dateParser';
import { PixelButton } from '../ui/PixelButton';
import { PixelBadge } from '../ui/PixelBadge';
import { IconPlus, IconSparkle } from '../icons/PixelIcons';

export interface QuickAddInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  onAdded?: () => void;
  className?: string;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  placeholder = 'Add a new quest (e.g. "Deploy update tomorrow 5pm !epic #work")...',
  autoFocus = false,
  onAdded,
  className = '',
}) => {
  const [input, setInput] = useState('');
  const addQuest = useSkyDoStore((state) => state.addQuest);

  const parsed = input.trim() ? parseNaturalLanguageQuest(input) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const data = parseNaturalLanguageQuest(input);
    addQuest({
      title: data.title || input.trim(),
      priority: data.priority,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      tags: data.tags,
      subtasks: [],
      xpReward: 20,
      coinReward: 12,
    });

    setInput('');
    if (onAdded) onAdded();
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pixel-input text-sm text-[#2B2118] bg-white pr-9 h-10"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-sans text-[#8A8D91] hover:text-[#2B2118] p-1"
            >
              ✕
            </button>
          )}
        </div>
        <PixelButton
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim()}
          className="shrink-0 flex items-center gap-1.5 h-10"
        >
          <IconPlus size={14} />
          <span>Plant Quest</span>
        </PixelButton>
      </form>

      {/* Real-time Natural Language Preview tags */}
      {parsed && (parsed.dueDate || parsed.dueTime || parsed.priority !== 'common' || parsed.tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 text-xs">
          <span className="text-[11px] font-sans font-semibold text-[#6B5A49] flex items-center gap-1">
            <IconSparkle size={12} /> Detected:
          </span>
          {parsed.priority !== 'common' && (
            <PixelBadge priority={parsed.priority} />
          )}
          {parsed.dueDate && (
            <span className="px-2 py-0.5 bg-[#EFE6D2] border border-[#CDBE9F] text-[#4A3D2F] font-sans text-xs rounded-xs">
              📅 {parsed.dueDate} {parsed.dueTime ? `at ${parsed.dueTime}` : ''}
            </span>
          )}
          {parsed.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#FAF6ED] border border-[#CDBE9F] text-[#6B5A49] font-sans text-xs rounded-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
