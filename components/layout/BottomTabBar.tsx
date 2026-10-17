'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { ActiveTab } from '../../lib/types';
import { QuestModal } from '../quests/QuestModal';
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
  IconPlus,
} from '../icons/PixelIcons';

export const BottomTabBar: React.FC = () => {
  const activeTab = useSkyDoStore((state) => state.activeTab);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!isMoreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMoreOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMoreOpen]);

  const mainTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'island', label: 'Island', icon: <IconIsland size={18} /> },
    { id: 'quests', label: 'Quests', icon: <IconQuest size={18} /> },
    { id: 'minions', label: 'Minions', icon: <IconMinion size={18} /> },
    { id: 'mining', label: 'Mining', icon: <IconPickaxe size={18} /> },
    { id: 'calendar', label: 'Almanac', icon: <IconCalendar size={18} /> },
  ];

  const moreItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'skills', label: 'Skill Perks', icon: <IconSkills size={20} /> },
    { id: 'library', label: 'Tome Library', icon: <IconLibrary size={20} /> },
    { id: 'chest', label: 'Bazaar Chest', icon: <IconChest size={20} /> },
    { id: 'settings', label: 'Island Settings', icon: <IconSettings size={20} /> },
  ];

  const isMoreActive = ['skills', 'library', 'chest', 'settings'].includes(activeTab);

  return (
    <>
      {/* Mobile Floating Action Button (+) */}
      <div className="md:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-3 sm:right-4 z-40">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-12 h-12 pixel-btn pixel-btn-primary rounded-xs flex items-center justify-center shadow-lg cursor-pointer"
          aria-label="Add new quest"
        >
          <IconPlus size={20} />
        </button>
      </div>

      {/* Bottom Tab Bar Container */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pixel-panel-stone border-t-3 border-[#C7C9CC] bg-[#8A8D91] px-1 py-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around select-none w-full max-w-full">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                setActiveTab(tab.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-h-12 py-1.5 px-0.5 min-w-0 flex flex-col items-center justify-center gap-0.5 font-sans font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FBE186] ${
                isActive
                  ? 'bg-[#E3B341] text-[#2B2118] border-t border-l border-[#FBE186] border-r border-b border-[#99701A]'
                  : 'text-[#F4EFE6] hover:bg-[#7B7E82]'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate max-w-full text-center leading-none">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          aria-expanded={isMoreOpen}
          aria-label="More sections"
          aria-haspopup="dialog"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex-1 min-h-12 py-1.5 px-0.5 min-w-0 flex flex-col items-center justify-center gap-0.5 font-sans font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FBE186] ${
            isMoreActive
              ? 'bg-[#E3B341] text-[#2B2118] border-t border-l border-[#FBE186] border-r border-b border-[#99701A]'
              : 'text-[#F4EFE6] hover:bg-[#7B7E82]'
          }`}
        >
          <span className="text-sm">☰</span>
          <span className="truncate max-w-full text-center leading-none">More</span>
        </button>
      </nav>

      {/* Slide-Up "More" Sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-labelledby="more-sheet-title">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 pixel-panel-parchment p-4 border-t-4 border-[#C8B896] pb-8"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D5C7AF]">
                <h3 id="more-sheet-title" className="font-pixel text-base text-[#2B2118] font-bold">
                  SkyDo Features & Systems
                </h3>
                <button
                  type="button"
                  aria-label="Close more sections"
                  onClick={() => setIsMoreOpen(false)}
                  className="min-h-11 min-w-11 flex items-center justify-center text-[#6B5A49] font-sans text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E3B341] rounded-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`p-3 flex items-center gap-2.5 rounded-xs font-sans font-bold text-xs border text-left cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-[#E3B341] text-[#2B2118] border-[#99701A] font-bold'
                        : 'bg-white text-[#2B2118] border-[#D5C7AF] hover:bg-[#FAF6ED]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuestModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
};
