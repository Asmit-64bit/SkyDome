'use client';

import React, { useState } from 'react';
import { useSkyDoStore, getTodayDateString } from '../../store/useSkyDoStore';
import { FloatingIslandHero } from '../island/FloatingIslandHero';
import { QuickAddInput } from '../quests/QuickAddInput';
import { QuestItem } from '../quests/QuestItem';
import { QuestModal } from '../quests/QuestModal';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import { Quest } from '../../lib/types';
import {
  IconQuest,
  IconMinion,
  IconPickaxe,
  IconSparkle,
} from '../icons/PixelIcons';

export const IslandDashboard: React.FC = () => {
  const quests = useSkyDoStore((state) => state.quests);
  const minions = useSkyDoStore((state) => state.minions);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const checkMinionToday = useSkyDoStore((state) => state.checkMinionToday);
  const theme = useSkyDoStore((state) => state.theme);

  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = getTodayDateString();
  const overdueCount = quests.filter((q) => !q.completed && q.dueDate && q.dueDate < today).length;
  const dueTodayCount = quests.filter((q) => !q.completed && q.dueDate === today).length;

  // Today's Top Quests (uncompleted, prioritized by rarity)
  const priorityWeight = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const topQuests = quests
    .filter((q) => !q.completed && (!q.dueDate || q.dueDate <= today))
    .sort((a, b) => {
      const overdueOrder = Number(Boolean(b.dueDate && b.dueDate < today)) - Number(Boolean(a.dueDate && a.dueDate < today));
      return overdueOrder || priorityWeight[b.priority] - priorityWeight[a.priority];
    })
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Floating Island Hero with Growing Island & Drifting Clouds */}
      <FloatingIslandHero />

      <section aria-label="Today's progress" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div data-light-surface="true" className="pixel-panel-parchment p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-semibold text-[#5A4D3F]">Due today</div>
          <div className="font-number text-2xl font-bold text-[#2B2118] mt-1">{dueTodayCount}</div>
          <div className="text-xs text-[#6B5A49]">objectives to tackle</div>
        </div>
        <div data-light-surface="true" className={`pixel-panel-parchment p-3 sm:p-4 ${overdueCount ? 'border-l-4 border-l-[#B3392F]' : ''}`}>
          <div className="text-xs sm:text-sm font-semibold text-[#5A4D3F]">Overdue</div>
          <div className={`font-number text-2xl font-bold mt-1 ${overdueCount ? 'text-[#9B2F27]' : 'text-[#2B2118]'}`}>{overdueCount}</div>
          <div className="text-xs text-[#6B5A49]">{overdueCount ? 'ready to reschedule or finish' : 'you are all caught up'}</div>
        </div>
        <div data-light-surface="true" className="col-span-2 sm:col-span-1 pixel-panel-parchment p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-semibold text-[#5A4D3F]">Daily habits</div>
          <div className="font-number text-2xl font-bold text-[#2B2118] mt-1">{minions.filter((m) => m.completedDates.includes(today)).length}<span className="text-base text-[#6B5A49]">/{minions.length}</span></div>
          <div className="text-xs text-[#6B5A49]">minion plots harvested</div>
        </div>
      </section>

      {/* Quick Add Bar */}
      <div data-light-surface="true" className="pixel-panel-parchment p-4 border-2 border-[#D5C7AF]">
        <div className="flex items-center gap-2 mb-2 text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F]">
          <IconSparkle size={14} />
          <span>PLANT A NEW OBJECTIVE:</span>
        </div>
        <QuickAddInput />
      </div>

      {/* Two Column Section: Today's Quests & Minions / Focus Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Priority Quests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-pixel text-lg ${theme === 'galaxy' ? 'text-[#F4EAFE]' : 'text-[#2B2118]'} font-bold flex items-center gap-2`}>
              <IconQuest size={18} />
              Today&apos;s Focus & Overdue
            </h3>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('quests')}
              className="text-xs"
            >
              View All Quests ({quests.filter((q) => !q.completed).length}) →
            </PixelButton>
          </div>

          <div className="space-y-2.5">
            {topQuests.length === 0 ? (
              <div className="pixel-panel-parchment p-8 text-center border border-[#D5C7AF]">
                <p className="text-xs font-sans text-[#5A4D3F] mb-3">
                  All today&apos;s objectives cleared! Your sanctuary is at peace.
                </p>
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setQuestToEdit(null);
                    setIsModalOpen(true);
                  }}
                >
                  + Add More Quests
                </PixelButton>
              </div>
            ) : (
              topQuests.map((quest) => (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  onEdit={(q) => {
                    setQuestToEdit(q);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Daily Minion Habits & Fast Focus Launch */}
        <div className="lg:col-span-5 space-y-5">
          {/* Minion Daily Harvest Checklist */}
          <PixelPanel
            variant="parchment"
            title="Minion Worker Plots"
            icon={<IconMinion size={18} />}
            actions={
              <button
                type="button"
                onClick={() => setActiveTab('minions')}
                className="text-xs font-sans font-bold text-[#6B5A49] hover:text-[#2B2118]"
              >
                Plots Grid →
              </button>
            }
          >
            <p className="text-xs text-[#5A4D3F] mb-3">
              Check in on daily recurring habits to compound your minion yields.
            </p>

            <div className="space-y-2">
              {minions.slice(0, 4).map((m) => {
                const isDone = m.completedDates.includes(today);
                return (
                  <div
                    key={m.id}
                    className="p-2 bg-[#FAF6ED] border border-[#D5C7AF] rounded-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">{isDone ? '✓' : '⚙️'}</span>
                      <div className="truncate">
                        <div className="text-xs font-sans font-bold text-[#2B2118] truncate">
                          {m.name}
                        </div>
                        <div className="text-[11px] text-[#6B5A49] truncate">
                          {m.habit}
                        </div>
                      </div>
                    </div>

                    <PixelButton
                      variant={isDone ? 'stone' : 'primary'}
                      size="sm"
                      onClick={() => checkMinionToday(m.id)}
                      className="text-xs shrink-0 px-2 py-0.5"
                    >
                      {isDone ? 'Done' : 'Harvest'}
                    </PixelButton>
                  </div>
                );
              })}
            </div>
          </PixelPanel>

          {/* Quick Launch Focus Mining */}
          <PixelPanel
            variant="wood"
            title="Focus Mining Shaft"
            icon={<IconPickaxe size={18} />}
          >
            <p className="text-xs text-[#FAF6ED] mb-3">
              Need uninterrupted flow? Jump straight into deep focus Pomodoro mining.
            </p>
            <PixelButton
              variant="primary"
              size="md"
              onClick={() => setActiveTab('mining')}
              className="w-full text-xs font-sans font-bold"
            >
              ⚒️ Enter Mining Shaft
            </PixelButton>
          </PixelPanel>
        </div>
      </div>

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
