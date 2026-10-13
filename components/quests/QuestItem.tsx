'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Quest, QuestPriority } from '../../lib/types';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { PixelBadge } from '../ui/PixelBadge';
import { IconCheck, IconTrash, IconPickaxe } from '../icons/PixelIcons';

export interface QuestItemProps {
  quest: Quest;
  onEdit: (quest: Quest) => void;
}

export const QuestItem: React.FC<QuestItemProps> = ({ quest, onEdit }) => {
  const toggleQuest = useSkyDoStore((state) => state.toggleQuest);
  const deleteQuest = useSkyDoStore((state) => state.deleteQuest);
  const toggleSubtask = useSkyDoStore((state) => state.toggleSubtask);
  const addSubtask = useSkyDoStore((state) => state.addSubtask);
  const deleteSubtask = useSkyDoStore((state) => state.deleteSubtask);
  const linkMiningQuest = useSkyDoStore((state) => state.linkMiningQuest);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Priority-specific border accents (muted tones, NOT neon)
  const priorityBorderClasses: Record<QuestPriority, string> = {
    common: 'border-l-4 border-l-[#8A8D91]',
    uncommon: 'border-l-4 border-l-[#5FA244]',
    rare: 'border-l-4 border-l-[#4AA3B5]',
    epic: 'border-l-4 border-l-[#E3B341]',
    legendary: 'border-l-4 border-l-[#B3392F]',
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!quest.completed && !reducedMotion) {
      // Trigger pixel confetti burst from button location
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { x, y },
          colors: ['#5FA244', '#E3B341', '#8A8D91', '#4AA3B5', '#FAF6ED'],
          shapes: ['square'],
          disableForReducedMotion: true,
          scalar: 0.8,
        });
      } catch {
        // Fallback gracefully
      }
    }

    toggleQuest(quest.id);
  };

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    linkMiningQuest(quest.id);
    setActiveTab('mining');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(quest.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const completedSubtasks = quest.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = quest.subtasks.length;

  return (
    <div
      className={`group relative pixel-panel-parchment p-3 sm:p-4 transition-all duration-150 ${
        priorityBorderClasses[quest.priority]
      } ${
        quest.completed
          ? 'opacity-65 bg-[#EFE9DC]'
          : 'hover:shadow-md hover:border-[#B5A586]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom tactile pixel checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={quest.completed ? 'Mark incomplete' : 'Mark quest complete'}
          className={`shrink-0 w-6 h-6 mt-0.5 flex items-center justify-center cursor-pointer transition-all border-2 rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-[#E3B341] ${
            quest.completed
              ? 'bg-[#5FA244] border-[#3F7A2E] text-white shadow-inner'
              : 'bg-white border-[#7A7368] hover:border-[#2B2118]'
          }`}
        >
          {quest.completed && <IconCheck size={14} />}
        </button>

        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <PixelBadge priority={quest.priority} />

            {quest.dueDate && (
              <span className="text-[11px] font-sans font-semibold text-[#5A4D3F] px-1.5 py-0.2 bg-[#EAE0CA] border border-[#CDBE9F] rounded-xs">
                📅 {quest.dueDate} {quest.dueTime ? `• ${quest.dueTime}` : ''}
              </span>
            )}

            {quest.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-sans text-[#6B5A49] px-1.5 py-0.2 bg-[#FAF6ED] border border-[#D5C7AF] rounded-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h4
            onClick={() => onEdit(quest)}
            className={`text-sm sm:text-base font-medium cursor-pointer hover:text-[#5FA244] transition-colors leading-snug ${
              quest.completed ? 'line-through text-[#7A7368]' : 'text-[#2B2118]'
            }`}
          >
            {quest.title}
          </h4>

          {quest.description && (
            <p className="text-xs text-[#5A4D3F] mt-1 line-clamp-2">
              {quest.description}
            </p>
          )}

          {/* Subtask preview pill & expand toggle */}
          {totalSubtasks > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-sans font-semibold text-[#6B5A49] hover:text-[#2B2118] flex items-center gap-1.5 px-2 py-0.5 bg-[#EAE0CA] border border-[#CDBE9F] rounded-xs cursor-pointer"
              >
                <span>
                  {expanded ? '▲' : '▼'} Checklist: {completedSubtasks}/{totalSubtasks}
                </span>
                <span className="font-number font-bold text-[11px] text-[#2B2118]">
                  ({Math.round((completedSubtasks / totalSubtasks) * 100)}%)
                </span>
              </button>

              {/* Visual mini progress bar */}
              <div className="w-16 sm:w-20 h-2 bg-[#D5C7AF] rounded-xs overflow-hidden border border-[#B5A586]">
                <div
                  className="h-full bg-[#5FA244] transition-all duration-300"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Expanded Subtask List */}
          {expanded && (
            <div className="mt-3 pl-2 sm:pl-3 border-l-2 border-[#D5C7AF] space-y-1.5">
              {quest.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 text-xs py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(quest.id, st.id)}
                      className="accent-[#5FA244] w-3.5 h-3.5 rounded-xs cursor-pointer"
                    />
                    <span
                      className={`truncate ${
                        st.completed
                          ? 'line-through text-[#8A8D91]'
                          : 'text-[#2B2118]'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(quest.id, st.id)}
                    className="text-[#8A8D91] hover:text-[#B3392F] px-1 font-sans text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add subtask inline form */}
              <form onSubmit={handleAddSubtask} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="New subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="pixel-input text-xs py-1 px-2 flex-1 h-7 bg-white"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="pixel-btn pixel-btn-ghost text-xs px-2 py-1 h-7"
                >
                  + Add
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {!quest.completed && (
            <button
              type="button"
              onClick={handleStartFocus}
              title="Start Pomodoro focus session linked to this quest"
              className="p-1.5 text-[#5A4D3F] hover:text-[#8A8D91] hover:bg-[#EAE0CA] border border-transparent hover:border-[#CDBE9F] rounded-xs"
            >
              <IconPickaxe size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(quest)}
            title="Edit quest details"
            className="p-1.5 text-[#5A4D3F] hover:text-[#2B2118] hover:bg-[#EAE0CA] border border-transparent hover:border-[#CDBE9F] rounded-xs font-sans font-bold text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteQuest(quest.id)}
            title="Delete quest"
            className="p-1.5 text-[#8A8D91] hover:text-[#B3392F] hover:bg-[#F9ECEB] border border-transparent hover:border-[#B3392F] rounded-xs"
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
