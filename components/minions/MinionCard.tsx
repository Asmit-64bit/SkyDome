'use client';

import React, { useState } from 'react';
import { Minion, MinionIcon } from '../../lib/types';
import { useSkyDoStore, getTodayDateString } from '../../store/useSkyDoStore';
import { PixelBadge } from '../ui/PixelBadge';
import { PixelButton } from '../ui/PixelButton';
import { IconCoin, IconTrash, IconSparkle } from '../icons/PixelIcons';

export interface MinionCardProps {
  minion: Minion;
  onEdit: (minion: Minion) => void;
}

export const MinionCard: React.FC<MinionCardProps> = ({ minion, onEdit }) => {
  const checkMinionToday = useSkyDoStore((state) => state.checkMinionToday);
  const toggleMinionDate = useSkyDoStore((state) => state.toggleMinionDate);
  const upgradeMinion = useSkyDoStore((state) => state.upgradeMinion);
  const deleteMinion = useSkyDoStore((state) => state.deleteMinion);
  const coins = useSkyDoStore((state) => state.coins);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  const [harvestBurst, setHarvestBurst] = useState(false);

  const today = getTodayDateString();
  const isDoneToday = minion.completedDates.includes(today);

  const handleHarvest = () => {
    if (!isDoneToday) {
      setHarvestBurst(true);
      setTimeout(() => setHarvestBurst(false), 1200);
    }
    checkMinionToday(minion.id);
  };

  // Generate 28-day history grid for the 4-week heatmap
  const get28Days = () => {
    const list: { date: string; dayLabel: string; done: boolean; isToday: boolean }[] = [];
    const baseDate = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      list.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        done: minion.completedDates.includes(dateStr),
        isToday: dateStr === today,
      });
    }
    return list;
  };

  const heatmapDays = get28Days();
  const upgradeCost = minion.level * 50;
  const canUpgrade = coins >= upgradeCost;

  // Resource Icon Colors
  const resourceColors: Record<MinionIcon, string> = {
    wheat: '#E3B341',
    wood: '#B98E55',
    iron: '#C7C9CC',
    stone: '#8A8D91',
    water: '#4AA3B5',
    carrot: '#D97736',
    diamond: '#4AA3B5',
    book: '#8B5A2B',
  };

  return (
    <div className="pixel-panel-parchment p-4 flex flex-col justify-between border-2 border-[#D5C7AF] hover:border-[#B5A586] transition-all">
      {/* Header: Name, Category, Tier Level */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <PixelBadge category={minion.category} />
              <span className="text-[11px] font-sans text-[#8A8D91] px-1.5 py-0.2 bg-[#EAE0CA] rounded-xs font-bold uppercase tracking-wider">
                TIER {minion.level}
              </span>
            </div>
            <h4 className="font-pixel text-base text-[#2B2118] font-bold">
              {minion.name}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(minion)}
              className="text-xs font-sans font-bold text-[#6B5A49] hover:text-[#2B2118] px-1.5 py-0.5 bg-[#EAE0CA] rounded-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteMinion(minion.id)}
              className="text-[#8A8D91] hover:text-[#B3392F] p-1"
            >
              <IconTrash size={13} />
            </button>
          </div>
        </div>

        {/* Habit Description */}
        <p className="text-xs text-[#5A4D3F] mb-3 font-medium bg-[#F3EAD7] p-2 border border-[#E2D5BA] rounded-xs">
          🎯 {minion.habit}
        </p>

        {/* Visual Minion Plot Stage */}
        <div className="relative pixel-slot-light p-3 mb-3 flex items-center justify-around overflow-hidden rounded-xs min-h-[90px]">
          {/* Animated Minion Sprite */}
          <div className="flex flex-col items-center">
            {/* Bobbing head & body */}
            <div
              className={`relative flex flex-col items-center ${
                reducedMotion ? '' : isDoneToday ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Floating Harvest Pop Notification */}
              {harvestBurst && (
                <div className="absolute -top-7 px-2 py-0.5 bg-[#E3B341] border border-[#99701A] text-[#2B2118] font-sans text-xs font-bold rounded-xs animate-bounce shadow-md">
                  +{minion.level * 2} {minion.resourceName}!
                </div>
              )}

              {/* Minion Character Head */}
              <div className="w-8 h-8 bg-[#B98E55] border-t-2 border-l-2 border-[#DEB982] border-r-2 border-b-2 border-[#6B4A2B] relative flex items-center justify-center">
                {/* Eyes */}
                <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-[#2B2118]" />
                <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-[#2B2118]" />
                {/* Cheeks */}
                <div className="absolute bottom-1.5 left-1 w-1 h-1 bg-[#D97736]" />
                <div className="absolute bottom-1.5 right-1 w-1 h-1 bg-[#D97736]" />
              </div>

              {/* Minion Overalls Body */}
              <div className="w-7 h-4 bg-[#4B4E52] border border-[#383B3E] flex items-center justify-center">
                <div
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: resourceColors[minion.iconType] }}
                />
              </div>
            </div>

            {/* Dirt/Grass Plot Stand */}
            <div className="w-14 h-3 bg-[#5FA244] border-t-2 border-[#7EC461] border-b-2 border-[#3F7A2E] mt-0.5" />
            <div className="w-12 h-2 bg-[#8B5A2B] border-b border-[#5E3B1C]" />
          </div>

          {/* Habit Stats Box */}
          <div className="flex flex-col text-xs gap-1">
            <div className="flex items-center gap-1.5 text-[#2B2118]">
              <span className="text-[#B3392F]">🔥</span>
              <span className="font-bold"><span className="font-number font-bold">{minion.streak}</span> Day Streak</span>
            </div>
            <div className="text-[11px] text-[#6B5A49]">
              Best: <span className="font-number font-semibold">{minion.bestStreak}</span> days
            </div>
            <div className="text-[11px] text-[#326122] flex items-center gap-1">
              <IconSparkle size={12} />
              <span><span className="font-number font-bold">{minion.totalProduced}</span> {minion.resourceName}</span>
            </div>
          </div>
        </div>

        {/* 4-Week Mini Heatmap */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-[#6B5A49] mb-1">
            <span className="font-sans font-bold uppercase tracking-wider">4-WEEK HABIT LOG (28 DAYS)</span>
            <span><span className="font-number font-bold">{minion.completedDates.length}</span> TOTAL DROPS</span>
          </div>

          {/* 4 rows x 7 cols grid */}
          <div className="grid grid-cols-7 gap-1 bg-[#EAE0CA] p-1.5 border border-[#CDBE9F] rounded-xs">
            {heatmapDays.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => toggleMinionDate(minion.id, d.date)}
                title={`${d.dayLabel}: ${d.done ? 'Harvested' : 'Not yet'} (Click to toggle)`}
                className={`w-full aspect-square transition-all border outline-none cursor-pointer ${
                  d.done
                    ? 'bg-[#5FA244] border-[#3F7A2E] hover:bg-[#72B855]'
                    : 'bg-[#FAF6ED] border-[#D5C7AF] hover:bg-[#E2D5BA]'
                } ${d.isToday ? 'ring-2 ring-[#E3B341]' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls: Daily Check-in & Upgrade */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#D5C7AF]">
        <PixelButton
          variant={isDoneToday ? 'stone' : 'primary'}
          size="md"
          onClick={handleHarvest}
          className="flex-1 text-xs font-sans font-bold"
        >
          {isDoneToday ? '✓ Worked Today' : '⚡ Harvest Habit'}
        </PixelButton>

        <PixelButton
          variant="ghost"
          size="md"
          disabled={!canUpgrade}
          onClick={() => upgradeMinion(minion.id)}
          title={`Upgrade to Tier ${minion.level + 1} (${upgradeCost} coins)`}
          className="text-xs font-sans font-bold flex items-center gap-1 shrink-0 px-2"
        >
          <span>Upgrade</span>
          <span className="flex items-center text-[#875F0E] font-bold">
            <IconCoin size={12} />
            {upgradeCost}
          </span>
        </PixelButton>
      </div>
    </div>
  );
};
