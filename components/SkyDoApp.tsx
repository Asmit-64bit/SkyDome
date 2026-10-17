'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useSkyDoStore } from '../store/useSkyDoStore';
import { Sidebar } from './layout/Sidebar';
import { BottomTabBar } from './layout/BottomTabBar';
import { CommandPalette } from './layout/CommandPalette';
import { OnboardingModal } from './layout/OnboardingModal';
import { ToastContainer } from './ui/ToastContainer';

import { IslandLevelUpModal } from './layout/IslandLevelUpModal';

// Feature Views
import { IslandDashboard } from './views/IslandDashboard';
import { QuestsView } from './views/QuestsView';
import { MinionsView } from './views/MinionsView';
import { MiningView } from './views/MiningView';
import { SkillsView } from './views/SkillsView';
import { LibraryView } from './views/LibraryView';
import { ChestView } from './views/ChestView';
import { CalendarView } from './views/CalendarView';
import { SettingsView } from './views/SettingsView';

import {
  IconIsland,
  IconCampfire,
  IconCoin,
  IconSearch,
} from './icons/PixelIcons';

export const SkyDoApp: React.FC = () => {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const musicRef = React.useRef<HTMLAudioElement>(null);
  const activeTab = useSkyDoStore((state) => state.activeTab);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const theme = useSkyDoStore((state) => state.theme);
  const numberFont = useSkyDoStore((state) => state.numberFont);
  const islandName = useSkyDoStore((state) => state.islandName);
  const islandLevel = useSkyDoStore((state) => state.islandLevel);
  const streak = useSkyDoStore((state) => state.streak);
  const coins = useSkyDoStore((state) => state.coins);
  const soundEnabled = useSkyDoStore((state) => state.soundEnabled);
  const soundVolume = useSkyDoStore((state) => state.soundVolume);
  const setCommandPaletteOpen = useSkyDoStore((state) => state.setCommandPaletteOpen);
  const setNumberFont = useSkyDoStore((state) => state.setNumberFont);

  // Global Mining Timer State
  const mining = useSkyDoStore((state) => state.mining);
  const tickMiningTimer = useSkyDoStore((state) => state.tickMiningTimer);
  useEffect(() => {
    // Upgrade legacy 'silkscreen' default to 'tabular' so numbers are immediately legible
    if (numberFont === 'silkscreen') {
      setNumberFont('tabular');
    }
  }, [numberFont, setNumberFont]);

  // Play the bundled island track alongside procedural effects when sound is enabled.
  useEffect(() => {
    if (!mounted) return;
    const audio = musicRef.current;
    if (!audio) return;
    audio.volume = Math.min(0.08, soundVolume * 0.08);

    if (!soundEnabled) {
      audio.pause();
      return;
    }

    let active = true;
    const tryPlay = () => {
      if (!active) return;
      void audio.play().then(() => {
        window.removeEventListener('pointerdown', tryPlay);
        window.removeEventListener('keydown', tryPlay);
      }).catch(() => {
        // Browsers may block autoplay until the user interacts with the page.
      });
    };

    tryPlay();
    window.addEventListener('pointerdown', tryPlay);
    window.addEventListener('keydown', tryPlay);
    return () => {
      active = false;
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, [mounted, soundEnabled, soundVolume]);

  // Global Background Focus Timer Loop - runs continuously across ALL views
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mining.state === 'running') {
      interval = setInterval(() => {
        tickMiningTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mining.state, tickMiningTimer]);

  // Sync timer immediately when tab regains focus or visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && useSkyDoStore.getState().mining.state === 'running') {
        useSkyDoStore.getState().tickMiningTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // Sync data-theme and data-number-font attributes on mount and change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-number-font', numberFont || 'tabular');
    }
  }, [theme, numberFont]);

  // Render the current active view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'island':
        return <IslandDashboard />;
      case 'quests':
        return <QuestsView />;
      case 'minions':
        return <MinionsView />;
      case 'mining':
        return <MiningView />;
      case 'skills':
        return <SkillsView />;
      case 'library':
        return <LibraryView />;
      case 'chest':
        return <ChestView />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <IslandDashboard />;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8EC9F0] to-[#DDF1FB] font-pixel text-xl text-[#2B2118]">
        <div className="p-6 pixel-panel-parchment text-center animate-pulse">
          <IconIsland size={40} className="mx-auto mb-2" />
          <span>Building SkyDome Island...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'galaxy' ? 'galaxy-sky-background' : 'bg-gradient-to-b from-[var(--color-sky-top)] to-[var(--color-sky-bottom)]'} ${theme === 'night' || theme === 'galaxy' ? 'dark-theme-text' : ''} transition-colors duration-500 font-sans text-[#2B2118] w-full max-w-full overflow-x-hidden`}>
      <audio ref={musicRef} src="/rizzlas-rizzlas-c418-224649.mp3" loop preload="none" aria-hidden="true" />
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 pb-28 sm:pb-32 md:pt-0 md:pb-8 md:ml-64 w-full max-w-full overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden fixed inset-x-0 top-0 z-50 pixel-panel-stone px-3 sm:px-4 py-2.5 min-h-16 flex items-center justify-between shadow-md w-full max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#5FA244] border border-[#7EC461] rounded-xs flex items-center justify-center shrink-0">
              <IconIsland size={18} />
            </div>
            <div className="min-w-0">
              <span className="font-pixel text-base font-bold text-[#F4EFE6] block leading-tight">
                SkyDome
              </span>
              <span className="text-[10px] font-sans font-medium text-[#C7C9CC] block leading-none truncate max-w-[130px] sm:max-w-[200px]">
                Lvl <span className="font-number font-bold">{islandLevel}</span> • {islandName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1 text-xs font-sans text-[#F4EFE6]">
              <IconCampfire size={13} />
              <span><span className="font-number font-bold">{streak}</span>d</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-sans text-[#E3B341]">
              <IconCoin size={13} />
              <span className="font-number font-bold">{coins}</span>
            </div>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1 text-[#F4EFE6] hover:bg-[#7B7E82] rounded-xs font-sans text-xs cursor-pointer"
              aria-label="Search or quick jump"
            >
              <IconSearch size={16} />
            </button>
          </div>
        </header>

        {/* Background Focus Timer Running Indicator */}
        {mining.state === 'running' && activeTab !== 'mining' && (
          <div className="bg-[#FAF6ED] border-b-2 border-[#C8B896] px-3 sm:px-6 py-2 shadow-xs flex items-center justify-between text-xs font-sans animate-fade-in sticky top-16 md:top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">⚒️</span>
              <span className="text-[#2B2118] font-bold truncate">
                Active Focus Session:
              </span>
              <span className="font-number font-bold text-sm text-[#B3392F] px-1.5 py-0.5 bg-black/5 rounded-xs">
                {Math.floor(mining.secondsRemaining / 60)}:
                {String(mining.secondsRemaining % 60).padStart(2, '0')}
              </span>
              <span className="text-[#6B5A49] hidden sm:inline capitalize font-medium">
                ({mining.currentBlock} Ore)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('mining')}
                className="px-2.5 py-1 bg-[#E3B341] text-[#2B2118] border border-[#99701A] font-sans text-xs font-bold rounded-xs hover:bg-[#F3C55A] transition-all cursor-pointer shadow-xs"
              >
                Return to Mine →
              </button>
            </div>
          </div>
        )}

        {/* Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 lg:p-8 min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Undo Toast System */}
      <ToastContainer />

      {/* Celebratory Island Level-Up Modal */}
      <IslandLevelUpModal />

      {/* 3-Step Onboarding Modal for New Islanders */}
      <OnboardingModal />
    </div>
  );
};
