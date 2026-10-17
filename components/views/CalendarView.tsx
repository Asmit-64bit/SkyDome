'use client';

import React, { useState } from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { Quest } from '../../lib/types';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import { PixelBadge } from '../ui/PixelBadge';
import { QuestModal } from '../quests/QuestModal';
import {
  IconCalendar,
  IconPlus,
} from '../icons/PixelIcons';

export const CalendarView: React.FC = () => {
  const quests = useSkyDoStore((state) => state.quests);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);

  // Month navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Generate Month Grid
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Trailing padding to make full weeks
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const days = getDaysInMonth();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Quests for selected day
  const selectedDayQuests = quests.filter((q) => q.dueDate === selectedDate);

  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="pixel-panel-parchment p-4 border-b-4 border-[#C8B896] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconCalendar size={24} />
            Skyblock Almanac ({monthYearLabel})
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Plot upcoming quests across time. Completing planned quests on schedule increases Fishing skill XP.
          </p>
        </div>

        {/* View Mode & Nav Buttons */}
        <div className="flex items-center gap-2">
          <PixelButton variant="ghost" size="sm" onClick={prevPeriod}>
            ◄
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={jumpToToday}>
            Today
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={nextPeriod}>
            ►
          </PixelButton>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        {/* Left Calendar Grid */}
        <div className="lg:col-span-8 pixel-panel-parchment p-2.5 sm:p-4 border-2 border-[#D5C7AF] w-full min-w-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs text-[#6B5A49] mb-2 font-bold uppercase tracking-wider">
            {dayLabels.map((lbl) => (
              <div key={lbl} className="py-0.5 sm:py-1 text-[10px] sm:text-xs bg-[#EAE0CA] rounded-xs border border-[#CDBE9F]">
                {lbl}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const questsOnDay = quests.filter((q) => q.dueDate === d.dateStr);
              const isSelected = selectedDate === d.dateStr;
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`min-h-[52px] sm:min-h-[80px] p-1 sm:p-1.5 border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF6ED] border-[#E3B341] ring-2 ring-[#E3B341] shadow-xs'
                      : d.isCurrentMonth
                      ? 'bg-white border-[#D5C7AF] hover:bg-[#FDFBF7]'
                      : 'bg-[#F2ECE1] border-[#E2D5BA] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-number font-bold px-1 rounded-xs ${
                        isToday
                          ? 'bg-[#E3B341] text-[#2B2118]'
                          : d.isCurrentMonth
                          ? 'text-[#2B2118]'
                          : 'text-[#8A8D91]'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    {questsOnDay.length > 0 && (
                      <span className="text-[10px] font-number text-[#6B5A49]">
                        {questsOnDay.length}
                      </span>
                    )}
                  </div>

                  {/* Quests preview mini blocks */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {questsOnDay.slice(0, 2).map((q) => (
                      <div
                        key={q.id}
                        className={`text-[9px] font-sans truncate px-1 py-0.2 rounded-xs border ${
                          q.completed
                            ? 'bg-[#EAEBED] border-[#8A8D91] text-[#8A8D91] line-through'
                            : q.priority === 'legendary'
                            ? 'bg-[#F9ECEB] border-[#B3392F] text-[#8F261E]'
                            : q.priority === 'epic'
                            ? 'bg-[#FAF4E5] border-[#E3B341] text-[#875F0E]'
                            : q.priority === 'rare'
                            ? 'bg-[#E7F4F7] border-[#4AA3B5] text-[#246370]'
                            : 'bg-[#EAF3E6] border-[#5FA244] text-[#326122]'
                        }`}
                      >
                        {q.title}
                      </div>
                    ))}
                    {questsOnDay.length > 2 && (
                      <div className="text-[9px] font-sans font-semibold text-[#8A8D91] text-center">
                        +{questsOnDay.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Day Inspector */}
        <div className="lg:col-span-4 pixel-panel-parchment p-5 border-2 border-[#D5C7AF] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D5C7AF]">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#6B5A49]">
                  SCHEDULED SLATE
                </span>
                <h3 className="font-pixel text-base font-bold text-[#2B2118]">
                  {selectedDate}
                </h3>
              </div>

              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setQuestToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs"
              >
                <IconPlus size={12} />
                <span>Add Due Quest</span>
              </PixelButton>
            </div>

            {/* Quests list for selected date */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayQuests.length === 0 ? (
                <div className="text-center py-10 text-xs font-sans text-[#8A8D91]">
                  No quests due on this date.
                  <br />
                  <span className="text-[11px] text-[#5A4D3F]">
                    Click &quot;+ Add Due Quest&quot; to schedule one.
                  </span>
                </div>
              ) : (
                selectedDayQuests.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setQuestToEdit(q);
                      setIsAddModalOpen(true);
                    }}
                    className={`p-2.5 bg-white border border-[#D5C7AF] rounded-xs cursor-pointer hover:border-[#8A8D91] transition-all ${
                      q.completed ? 'opacity-60 bg-[#FAF6ED]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <PixelBadge priority={q.priority} />
                      {q.dueTime && (
                        <span className="text-[11px] font-sans font-medium text-[#6B5A49]">
                          🕒 {q.dueTime}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        q.completed ? 'line-through text-[#8A8D91]' : 'text-[#2B2118]'
                      }`}
                    >
                      {q.title}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <QuestModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setQuestToEdit(null);
        }}
        questToEdit={questToEdit}
      />
    </div>
  );
};
