'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { ActiveTab } from '../../lib/types';
import {
  IconSearch,
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

export const CommandPalette: React.FC = () => {
  const isOpen = useSkyDoStore((state) => state.commandPaletteOpen);
  const setOpen = useSkyDoStore((state) => state.setCommandPaletteOpen);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const startMiningTimer = useSkyDoStore((state) => state.startMiningTimer);
  const soundEnabled = useSkyDoStore((state) => state.soundEnabled);
  const setSoundEnabled = useSkyDoStore((state) => state.setSoundEnabled);
  const quests = useSkyDoStore((state) => state.quests);
  const toggleQuest = useSkyDoStore((state) => state.toggleQuest);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Commands list
  const baseCommands = [
    {
      id: 'nav_island',
      title: 'Jump to Island Hub',
      category: 'Navigation',
      icon: <IconIsland size={16} />,
      action: () => setActiveTab('island'),
    },
    {
      id: 'nav_quests',
      title: 'Open Quest Log',
      category: 'Navigation',
      icon: <IconQuest size={16} />,
      action: () => setActiveTab('quests'),
    },
    {
      id: 'nav_minions',
      title: 'Inspect Minion Plots',
      category: 'Navigation',
      icon: <IconMinion size={16} />,
      action: () => setActiveTab('minions'),
    },
    {
      id: 'nav_mining',
      title: 'Enter Focus Mining Shaft',
      category: 'Navigation',
      icon: <IconPickaxe size={16} />,
      action: () => setActiveTab('mining'),
    },
    {
      id: 'action_start_mining',
      title: 'Start 25m Pomodoro Focus Session',
      category: 'Actions',
      icon: <IconPickaxe size={16} />,
      action: () => {
        setActiveTab('mining');
        startMiningTimer();
      },
    },
    {
      id: 'nav_skills',
      title: 'View Skills & Milestones',
      category: 'Navigation',
      icon: <IconSkills size={16} />,
      action: () => setActiveTab('skills'),
    },
    {
      id: 'nav_library',
      title: 'Open Tome Library',
      category: 'Navigation',
      icon: <IconLibrary size={16} />,
      action: () => setActiveTab('library'),
    },
    {
      id: 'nav_chest',
      title: 'Visit Bazaar & Vault',
      category: 'Navigation',
      icon: <IconChest size={16} />,
      action: () => setActiveTab('chest'),
    },
    {
      id: 'nav_calendar',
      title: 'Open Almanac Calendar',
      category: 'Navigation',
      icon: <IconCalendar size={16} />,
      action: () => setActiveTab('calendar'),
    },
    {
      id: 'nav_settings',
      title: 'Island Settings & Backup',
      category: 'Navigation',
      icon: <IconSettings size={16} />,
      action: () => setActiveTab('settings'),
    },
    {
      id: 'action_sound',
      title: `Turn Sound ${soundEnabled ? 'OFF' : 'ON'}`,
      category: 'Actions',
      icon: <IconSettings size={16} />,
      action: () => setSoundEnabled(!soundEnabled),
    },
  ];

  // Also include matching active quests
  const questCommands = quests
    .filter((q) => !q.completed)
    .map((q) => ({
      id: `quest_${q.id}`,
      title: `Quest: ${q.title}`,
      category: 'Quests',
      icon: <IconQuest size={16} />,
      action: () => {
        toggleQuest(q.id);
        setActiveTab('quests');
      },
    }));

  const allItems = [...baseCommands, ...questCommands];

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const executeItem = (item: (typeof filteredItems)[0]) => {
    item.action();
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      executeItem(filteredItems[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl pixel-panel-stone z-10 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Search Input bar */}
            <div className="p-3 bg-[#7B7E82] border-b-2 border-[#45474B] flex items-center gap-2">
              <IconSearch size={18} className="text-[#F4EFE6]" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, page, or quest..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[#F4EFE6] font-sans text-sm outline-none placeholder-[#C7C9CC]"
              />
              <kbd className="px-1.5 py-0.5 bg-[#4B4E52] text-[10px] text-[#C7C9CC] rounded-xs font-mono">
                ESC
              </kbd>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-xs font-sans text-[#C7C9CC]">
                  No matching commands found.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-2.5 rounded-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#E3B341] text-[#2B2118] font-bold'
                          : 'text-[#F4EFE6] hover:bg-[#7B7E82]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{item.icon}</span>
                        <span className="font-sans font-medium text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-sans font-bold px-1.5 py-0.2 rounded-xs uppercase tracking-wider ${
                          isSelected ? 'bg-[#2B2118] text-[#E3B341]' : 'bg-[#4B4E52] text-[#C7C9CC]'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-[#4B4E52] text-[10px] font-sans text-[#C7C9CC] flex items-center justify-between">
              <span>Navigate: ↑ ↓ • Select: ENTER</span>
              <span>SkyDo Quick Command Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
