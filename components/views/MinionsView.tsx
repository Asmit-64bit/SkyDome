'use client';

import React, { useState } from 'react';
import { useSkyDoStore, getTodayDateString } from '../../store/useSkyDoStore';
import confetti from 'canvas-confetti';
import { Minion } from '../../lib/types';
import { MinionCard } from '../minions/MinionCard';
import { MinionModal } from '../minions/MinionModal';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import {
  IconMinion,
  IconPlus,
  IconSparkle,
} from '../icons/PixelIcons';

export const MinionsView: React.FC = () => {
  const minions = useSkyDoStore((state) => state.minions);
  const harvestAllMinions = useSkyDoStore((state) => state.harvestAllMinions);
  const setUndoToast = useSkyDoStore((state) => state.setUndoToast);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minionToEdit, setMinionToEdit] = useState<Minion | null>(null);

  const today = getTodayDateString();
  const completedTodayCount = minions.filter((m) => m.completedDates.includes(today)).length;
  const totalMinions = minions.length;

  const handleEdit = (minion: Minion) => {
    setMinionToEdit(minion);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setMinionToEdit(null);
    setIsModalOpen(true);
  };

  const handleHarvestAll = () => {
    const res = harvestAllMinions();
    if (res.count > 0) {
      if (!reducedMotion) {
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#E3B341', '#5FA244', '#FAF6ED'],
            shapes: ['square'],
          });
        } catch {}
      }
      setUndoToast({
        id: `harvest_${Date.now()}`,
        type: 'quest_complete',
        title: `Harvested ${res.count} minions (+${res.totalCoins} Coins, +${res.totalXp} XP)`,
        data: {},
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pixel-panel-parchment p-4 border-b-4 border-[#C8B896] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconMinion size={24} />
            Minion Habit Compound Grid
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Automated worker minions representing recurring daily habits. Consistent streaks upgrade their tier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="pixel-slot p-2.5 px-3 flex items-center gap-2">
            <IconSparkle size={18} />
            <div>
              <div className="text-[10px] text-[#C7C9CC] font-sans font-bold uppercase tracking-wider">HARVEST STATUS</div>
              <div className="text-xs font-sans font-bold text-[#E3B341]">
                <span className="font-number">{completedTodayCount}</span> / <span className="font-number">{totalMinions}</span> Worked Today
              </div>
            </div>
          </div>

          {completedTodayCount < totalMinions && (
            <PixelButton
              variant="wood"
              size="md"
              onClick={handleHarvestAll}
              className="flex items-center gap-1.5 shrink-0 text-xs"
            >
              <span>⚡ Harvest All ({totalMinions - completedTodayCount})</span>
            </PixelButton>
          )}

          <PixelButton
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 shrink-0"
          >
            <IconPlus size={14} />
            <span>Deploy Minion</span>
          </PixelButton>
        </div>
      </div>

      {/* Grid of Minion Plots */}
      {minions.length === 0 ? (
        <div className="pixel-panel-parchment p-12 text-center border-2 border-dashed border-[#CDBE9F]">
          <div className="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">
            <IconMinion size={48} />
          </div>
          <h3 className="font-pixel text-base text-[#2B2118] font-bold mb-1">
            No Minions Working Your Plots
          </h3>
          <p className="text-xs text-[#5A4D3F] mb-4 max-w-sm mx-auto">
            Deploy automated habit minions to produce steady XP and resource crops every day.
          </p>
          <PixelButton variant="primary" size="md" onClick={handleCreateNew}>
            + Deploy Starter Minion
          </PixelButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {minions.map((minion) => (
            <MinionCard key={minion.id} minion={minion} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Minion Modal */}
      <MinionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMinionToEdit(null);
        }}
        minionToEdit={minionToEdit}
      />
    </div>
  );
};
