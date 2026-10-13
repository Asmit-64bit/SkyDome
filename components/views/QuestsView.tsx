'use client';

import React, { useState } from 'react';
import { useSkyDoStore, getTodayDateString } from '../../store/useSkyDoStore';
import { Quest, QuestPriority } from '../../lib/types';
import { QuestItem } from '../quests/QuestItem';
import { QuestModal } from '../quests/QuestModal';
import { QuickAddInput } from '../quests/QuickAddInput';
import { PixelTabs } from '../ui/PixelTabs';
import { PixelButton } from '../ui/PixelButton';
import {
  IconQuest,
  IconPlus,
  IconFilter,
  IconSearch,
} from '../icons/PixelIcons';

export const QuestsView: React.FC = () => {
  const quests = useSkyDoStore((state) => state.quests);
  const reorderQuests = useSkyDoStore((state) => state.reorderQuests);

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'all' | 'completed'>('today');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);

  const today = getTodayDateString();

  // Extract all unique tags
  const allTags = ['all', ...Array.from(new Set(quests.flatMap((q) => q.tags))).filter(Boolean)];

  // Filter logic
  const filteredQuests = quests.filter((q) => {
    // 1. Tab filter
    if (activeTab === 'today') {
      if (q.completed) return false;
      if (q.dueDate && q.dueDate !== today) return false;
    } else if (activeTab === 'upcoming') {
      if (q.completed) return false;
      if (!q.dueDate || q.dueDate <= today) return false;
    } else if (activeTab === 'completed') {
      if (!q.completed) return false;
    }

    // 2. Priority filter
    if (priorityFilter !== 'all' && q.priority !== priorityFilter) {
      return false;
    }

    // 3. Tag filter
    if (selectedTag !== 'all' && !q.tags.includes(selectedTag)) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(qLower);
      const matchDesc = q.description?.toLowerCase().includes(qLower);
      const matchTags = q.tags.some((t) => t.toLowerCase().includes(qLower));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    return true;
  });

  const handleEdit = (quest: Quest) => {
    setQuestToEdit(quest);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setQuestToEdit(null);
    setIsModalOpen(true);
  };

  // Reordering helpers (move up / down)
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredQuests.length) return;

    const itemA = filteredQuests[index];
    const itemB = filteredQuests[targetIndex];

    const updated = [...quests];
    const idxA = updated.findIndex((q) => q.id === itemA.id);
    const idxB = updated.findIndex((q) => q.id === itemB.id);

    if (idxA !== -1 && idxB !== -1) {
      const temp = updated[idxA];
      updated[idxA] = updated[idxB];
      updated[idxB] = temp;
      reorderQuests(updated);
    }
  };

  const todayCount = quests.filter((q) => !q.completed && (!q.dueDate || q.dueDate === today)).length;
  const upcomingCount = quests.filter((q) => !q.completed && q.dueDate && q.dueDate > today).length;
  const allCount = quests.filter((q) => !q.completed).length;
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pixel-panel-parchment p-4 border-b-4 border-[#C8B896] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconQuest size={24} />
            Quest Log & Objectives
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Forge your daily productivity campaign. Slay quests to earn XP and level up your island sanctuary.
          </p>
        </div>

        <PixelButton
          variant="primary"
          size="md"
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 shrink-0"
        >
          <IconPlus size={14} />
          <span>New Quest</span>
        </PixelButton>
      </div>

      {/* Quick Add Bar */}
      <div className="pixel-panel-parchment p-4 border-2 border-[#D5C7AF]">
        <QuickAddInput />
      </div>

      {/* Navigation Tabs (Today, Upcoming, All, Completed) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <PixelTabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          tabs={[
            { id: 'today', label: 'Today', count: todayCount },
            { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
            { id: 'all', label: 'All Quests', count: allCount },
            { id: 'completed', label: 'Completed', count: completedCount },
          ]}
        />

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pixel-input text-xs h-9 bg-white pr-7 text-[#2B2118]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A8D91]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Row (Priority & Tags) */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
        <span className="text-[#6B5A49] flex items-center gap-1 font-semibold">
          <IconFilter size={12} /> Priority:
        </span>
        {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriorityFilter(p)}
            className={`px-2 py-0.5 rounded-xs transition-all uppercase cursor-pointer text-[11px] tracking-wider ${
              priorityFilter === p
                ? 'bg-[#2B2118] text-[#E3B341] font-bold shadow-xs'
                : 'bg-[#EAE0CA] text-[#5A4D3F] hover:bg-[#FAF6ED] border border-[#CDBE9F] font-semibold'
            }`}
          >
            {p}
          </button>
        ))}

        {allTags.length > 1 && (
          <>
            <span className="text-[#6B5A49] ml-2 font-semibold">Tag:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-2 py-0.5 rounded-xs transition-all cursor-pointer text-[11px] ${
                  selectedTag === tag
                    ? 'bg-[#5FA244] text-white font-bold'
                    : 'bg-[#FAF6ED] text-[#6B5A49] border border-[#D5C7AF] hover:bg-[#EAE0CA] font-medium'
                }`}
              >
                #{tag}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <div className="pixel-panel-parchment p-12 text-center border-2 border-dashed border-[#CDBE9F]">
            <div className="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">
              <IconQuest size={48} />
            </div>
            <h3 className="font-pixel text-base text-[#2B2118] font-bold mb-1">
              Your island is quiet. Plant your first quest.
            </h3>
            <p className="text-xs text-[#5A4D3F] mb-4 max-w-sm mx-auto">
              {activeTab === 'completed'
                ? 'No completed quests in this view. Clear tasks to fill your archives.'
                : 'Use the quick-add bar above or click below to plant a new adventure.'}
            </p>
            {activeTab !== 'completed' && (
              <PixelButton variant="primary" size="md" onClick={handleCreateNew}>
                + Plant First Quest
              </PixelButton>
            )}
          </div>
        ) : (
          filteredQuests.map((quest, idx) => (
            <div key={quest.id} className="relative flex items-center gap-2">
              <div className="flex-1">
                <QuestItem quest={quest} onEdit={handleEdit} />
              </div>

              {/* Reordering Up/Down Buttons */}
              <div className="hidden sm:flex flex-col gap-1 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="w-5 h-5 flex items-center justify-center bg-[#EAE0CA] border border-[#CDBE9F] rounded-xs text-[10px] font-sans font-bold disabled:opacity-30 hover:bg-[#FAF6ED]"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === filteredQuests.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="w-5 h-5 flex items-center justify-center bg-[#EAE0CA] border border-[#CDBE9F] rounded-xs text-[10px] font-sans font-bold disabled:opacity-30 hover:bg-[#FAF6ED]"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setQuestToEdit(null);
        }}
        questToEdit={questToEdit}
      />
    </div>
  );
};
