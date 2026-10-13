'use client';

import React from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { ActiveTab } from '../../lib/types';
import {
  IconIsland,
  IconQuest,
  IconMinion,
  IconPickaxe,
  IconSkills,
  IconLibrary,
  IconChest,
  IconCalendar,
  IconSettings,
  IconCoin,
  IconSound,
  IconSearch,
} from '../icons/PixelIcons';

export const Sidebar: React.FC = () => {
  const activeTab = useSkyDoStore((state) => state.activeTab);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const islandName = useSkyDoStore((state) => state.islandName);
  const islandLevel = useSkyDoStore((state) => state.islandLevel);
  const coins = useSkyDoStore((state) => state.coins);
  const soundEnabled = useSkyDoStore((state) => state.soundEnabled);
  const setSoundEnabled = useSkyDoStore((state) => state.setSoundEnabled);
  const setCommandPaletteOpen = useSkyDoStore((state) => state.setCommandPaletteOpen);
  const quests = useSkyDoStore((state) => state.quests);

  const pendingQuests = quests.filter((q) => !q.completed).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'island', label: 'Island Hub', icon: <IconIsland size={20} /> },
    { id: 'quests', label: 'Quest Log', icon: <IconQuest size={20} />, badge: pendingQuests },
    { id: 'minions', label: 'Minion Plots', icon: <IconMinion size={20} /> },
    { id: 'mining', label: 'Focus Mining', icon: <IconPickaxe size={20} /> },
    { id: 'skills', label: 'Skill Perks', icon: <IconSkills size={20} /> },
    { id: 'library', label: 'Tome Library', icon: <IconLibrary size={20} /> },
    { id: 'chest', label: 'Bazaar Chest', icon: <IconChest size={20} /> },
    { id: 'calendar', label: 'Almanac', icon: <IconCalendar size={20} /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 pixel-panel-stone border-r-4 border-[#4B4E52] shrink-0 min-h-screen text-[#F4EFE6] select-none p-4 sticky top-0 h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-3 border-b-2 border-[#4B4E52]">
        <div className="w-9 h-9 bg-[#5FA244] border-2 border-[#7EC461] rounded-xs flex items-center justify-center shadow-xs">
          <IconIsland size={22} />
        </div>
        <div>
          <div className="font-pixel text-lg font-bold tracking-wider text-[#F4EFE6] flex items-center gap-1.5">
            <span>SkyDo</span>
            <span className="text-[10px] px-1 bg-[#E3B341] text-[#2B2118] rounded-xs font-bold">
              v1.0
            </span>
          </div>
          <div className="text-[11px] font-sans font-medium text-[#C7C9CC] truncate max-w-[140px]">
            {islandName}
          </div>
        </div>
      </div>

      {/* Island Level & Coin Pill */}
      <div className="pixel-slot p-2 mb-4 flex items-center justify-between text-xs font-sans font-bold">
        <div className="flex items-center gap-1.5 text-[#E3B341]">
          <IconCoin size={14} />
          <span><span className="font-number">{coins}</span> Coins</span>
        </div>
        <div className="px-1.5 py-0.5 bg-[#4B4E52] text-[#F4EFE6] rounded-xs font-number">
          LVL {islandLevel}
        </div>
      </div>

      {/* Command Palette Button */}
      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="w-full mb-4 px-2.5 py-1.5 bg-[#7B7E82] border-t border-l border-[#A8ABB0] border-r border-b border-[#45474B] text-[#F4EFE6] hover:bg-[#8A8D91] transition-all flex items-center justify-between text-xs font-sans font-semibold rounded-xs cursor-pointer shadow-xs"
      >
        <span className="flex items-center gap-1.5 text-[#FAF6ED]">
          <IconSearch size={14} /> Quick Jump
        </span>
        <kbd className="px-1.5 py-0.5 bg-[#45474B] text-[10px] rounded-xs border border-[#383A3C] font-mono">
          Ctrl+K
        </kbd>
      </button>

      {/* Main Nav Items List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xs font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#E3B341] ${
                isActive
                  ? 'bg-[#E3B341] text-[#2B2118] border-t-2 border-l-2 border-[#FBE186] border-r-2 border-b-2 border-[#99701A] font-bold shadow-xs'
                  : 'text-[#F4EFE6] hover:bg-[#7B7E82] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-xs font-sans font-bold ${
                    isActive
                      ? 'bg-[#2B2118] text-[#E3B341]'
                      : 'bg-[#4B4E52] text-[#F4EFE6]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer controls: Audio toggle */}
      <div className="pt-3 mt-3 border-t-2 border-[#4B4E52] flex items-center justify-between text-xs font-sans font-medium text-[#C7C9CC]">
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Toggle procedural retro 8-bit sound effects"
        >
          <IconSound muted={!soundEnabled} size={16} />
          <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <span className="text-[10px] text-[#A8ABB0] font-sans">Skyblock Theme</span>
      </div>
    </aside>
  );
};
