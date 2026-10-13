'use client';

import React from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { IconCampfire, IconCoin, IconSparkle } from '../icons/PixelIcons';
import { PixelProgress } from '../ui/PixelProgress';
import { IslandCanvas3D } from './IslandCanvas3D';

export const FloatingIslandHero: React.FC = () => {
  const islandName = useSkyDoStore((state) => state.islandName);
  const islandTitle = useSkyDoStore((state) => state.islandTitle);
  const islandLevel = useSkyDoStore((state) => state.islandLevel);
  const dailyXp = useSkyDoStore((state) => state.dailyXp);
  const dailyXpGoal = useSkyDoStore((state) => state.dailyXpGoal);
  const coins = useSkyDoStore((state) => state.coins);
  const streak = useSkyDoStore((state) => state.streak);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Date format: "Monday, October 12"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden pixel-panel-parchment p-5 sm:p-7 mb-6 border-b-4 border-[#C8B896]">
      {/* Sky Background with Pixel Clouds */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-sky-top)] to-[var(--color-sky-bottom)] opacity-90 pointer-events-none" />

      {/* Drifting Clouds */}
      <div
        className={`absolute top-4 left-[-15%] w-36 h-10 pointer-events-none opacity-70 ${
          reducedMotion ? '' : 'animate-[cloudDriftSlow_45s_linear_infinite]'
        }`}
      >
        <svg viewBox="0 0 72 20" fill="#FFFFFF" className="w-full h-full crisp-pixel">
          <rect x="12" y="4" width="48" height="12" />
          <rect x="24" y="0" width="24" height="6" />
          <rect x="0" y="8" width="72" height="8" />
        </svg>
      </div>

      <div
        className={`absolute top-16 left-[-20%] w-48 h-12 pointer-events-none opacity-60 ${
          reducedMotion ? '' : 'animate-[cloudDriftFast_32s_linear_infinite_10s]'
        }`}
      >
        <svg viewBox="0 0 96 24" fill="#FFFFFF" className="w-full h-full crisp-pixel">
          <rect x="16" y="6" width="64" height="14" />
          <rect x="32" y="2" width="32" height="8" />
          <rect x="0" y="10" width="96" height="10" />
        </svg>
      </div>

      {/* Main Grid: Left Greeting & Stats, Right Floating 3D Island */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Greeting, Name, XP Progress, Streak */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] px-2 py-0.5 bg-[#FAF6ED]/80 border border-[#CDBE9F] rounded-xs">
              {formattedDate}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF6ED]/90 border border-[#CDBE9F] text-xs font-sans text-[#B3392F] rounded-xs">
              <IconCampfire size={14} />
              <span className="font-semibold"><span className="font-number font-bold">{streak}</span> Day Streak</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF6ED]/90 border border-[#CDBE9F] text-xs font-sans text-[#875F0E] rounded-xs">
              <IconCoin size={14} />
              <span className="font-semibold"><span className="font-number font-bold">{coins}</span> Coins</span>
            </div>
          </div>

          <h1 className="font-pixel text-2xl sm:text-3xl text-[#2B2118] font-bold tracking-tight mb-1">
            {getGreeting()}, {islandName}!
          </h1>
          <p className="text-sm font-sans text-[#5A4D3F] mb-4">
            {islandTitle} • Level <span className="font-number font-bold">{islandLevel}</span> Skyblock Sanctuary
          </p>

          {/* Daily XP bar */}
          <div className="max-w-md bg-[#FAF6ED]/95 p-3 border-2 border-[#C8B896] shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-sans mb-1 text-[#2B2118]">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <IconSparkle size={14} />
                TODAY'S HARVEST XP
              </span>
              <span className="font-bold">
                <span className="font-number font-bold">{dailyXp}</span> / <span className="font-number font-bold">{dailyXpGoal}</span> XP
              </span>
            </div>
            <PixelProgress
              value={dailyXp}
              max={dailyXpGoal}
              variant="xp"
              showLabel={false}
              size="md"
            />
            <div className="flex items-center justify-between text-[11px] font-sans text-[#6B5A49] mt-1.5">
              <span>Next Island Upgrade: Level <span className="font-number font-bold">{islandLevel + 1}</span></span>
              <span className="font-semibold text-[#326122]">
                <span className="font-number font-bold">{Math.max(0, dailyXpGoal - dailyXp)}</span> XP to daily goal
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Voxel Island */}
        <div className="lg:col-span-6 flex justify-center items-center w-full min-w-0">
          <div className="w-full max-w-[540px] h-[280px] sm:h-[380px] lg:h-[440px] flex items-center justify-center relative">
            <IslandCanvas3D />
          </div>
        </div>
      </div>
    </div>
  );
};
