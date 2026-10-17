'use client';

import React, { useState } from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { IslandTheme } from '../../lib/types';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import { IconSettings, IconSound } from '../icons/PixelIcons';

export const SettingsView: React.FC = () => {
  const islandName = useSkyDoStore((state) => state.islandName);
  const islandTitle = useSkyDoStore((state) => state.islandTitle);
  const theme = useSkyDoStore((state) => state.theme);
  const shopItems = useSkyDoStore((state) => state.shopItems);
  const numberFont = useSkyDoStore((state) => state.numberFont);
  const soundEnabled = useSkyDoStore((state) => state.soundEnabled);
  const soundVolume = useSkyDoStore((state) => state.soundVolume);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);
  const timerSettings = useSkyDoStore((state) => state.timerSettings);

  const setIslandName = useSkyDoStore((state) => state.setIslandName);
  const setIslandTitle = useSkyDoStore((state) => state.setIslandTitle);
  const setTheme = useSkyDoStore((state) => state.setTheme);
  const setNumberFont = useSkyDoStore((state) => state.setNumberFont);
  const setSoundEnabled = useSkyDoStore((state) => state.setSoundEnabled);
  const setSoundVolume = useSkyDoStore((state) => state.setSoundVolume);
  const setReducedMotion = useSkyDoStore((state) => state.setReducedMotion);
  const setTimerSettings = useSkyDoStore((state) => state.setTimerSettings);
  const exportDataJson = useSkyDoStore((state) => state.exportDataJson);
  const importDataJson = useSkyDoStore((state) => state.importDataJson);
  const resetAllData = useSkyDoStore((state) => state.resetAllData);

  const canUseTheme = (themeId: string) => themeId === 'day' || Boolean(
    shopItems.find((item) => item.id === `theme_${themeId}`)?.owned
  );

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Handle Export File
  const handleExportFile = () => {
    const dataStr = exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyDome_island_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importDataJson(importText.trim());
    if (ok) {
      setImportStatus('Island data successfully imported! 🏝️');
      setImportText('');
    } else {
      setImportStatus('Error: Invalid JSON backup file.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="pixel-panel-parchment p-5 border-b-4 border-[#C8B896] flex items-center justify-between">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconSettings size={24} />
            Island Configuration & Archives
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Manage atmospheric preferences, timers, audio synthesis, and local data backups.
          </p>
        </div>
      </div>

      {/* Island Identity */}
      <PixelPanel variant="parchment" title="Island Identity & Ranks">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Sanctuary Island Name
            </label>
            <input
              type="text"
              value={islandName}
              onChange={(e) => setIslandName(e.target.value)}
              className="w-full pixel-input text-sm text-[#2B2118]"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Architect Title / Rank
            </label>
            <input
              type="text"
              value={islandTitle}
              onChange={(e) => setIslandTitle(e.target.value)}
              className="w-full pixel-input text-sm text-[#2B2118]"
            />
          </div>
        </div>
      </PixelPanel>

      {/* Atmospheric Theme Variants */}
      <PixelPanel variant="parchment" title="Atmospheric Sky Theme">
        <p className="text-xs text-[#5A4D3F] mb-3">
          Choose a daytime, twilight, or cosmic sky atmosphere for your sanctuary.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'day', label: 'Daytime Sky', desc: 'Clear azure horizon', bg: '#8EC9F0' },
            { id: 'sunset', label: 'Amber Sunset', desc: 'Warm dusk glow', bg: '#D87B40' },
            { id: 'cloudy', label: 'Overcast Slate', desc: 'Calm slate grey', bg: '#8E9CA8' },
            { id: 'night', label: 'Starry Midnight', desc: 'Deep navy celestial', bg: '#1B2939' },
            { id: 'galaxy', label: 'Galaxy Space', desc: 'Violet nebula and starfield', bg: '#29133F' },
          ].map((th) => (
            <button
              key={th.id}
              type="button"
              disabled={!canUseTheme(th.id)}
              onClick={() => setTheme(th.id as IslandTheme)}
              className={`p-3 text-left border-2 rounded-xs transition-all ${
                !canUseTheme(th.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              } ${
                theme === th.id
                  ? 'bg-white border-[#E3B341] shadow-xs ring-2 ring-[#E3B341]'
                  : 'bg-[#FAF6ED] border-[#D5C7AF] hover:bg-[#F3EAD7]'
              }`}
            >
              <div
                className="w-full h-8 mb-2 rounded-xs border border-black/10"
                style={{
                  backgroundColor: th.bg,
                  ...(th.id === 'galaxy' ? {
                    backgroundImage: 'radial-gradient(white 1px, transparent 1.4px), radial-gradient(#c9a6ff 1px, transparent 1.4px)',
                    backgroundSize: '17px 17px, 25px 25px',
                    backgroundPosition: '3px 4px, 11px 14px',
                  } : {}),
                }}
              />
              <div className="font-sans text-xs font-bold text-[#2B2118]">
                {th.label}
              </div>
              <div className="text-[10px] text-[#6B5A49]">
                {canUseTheme(th.id) ? th.desc : 'Purchase from the Bazaar to unlock'}
              </div>
            </button>
          ))}
        </div>
      </PixelPanel>

      {/* Number & Clock Typography */}
      <PixelPanel variant="parchment" title="Number & Clock Typography">
        <p className="text-xs text-[#5A4D3F] mb-3">
          Choose the typography style used for the focus countdown timer, durations, streaks, coins, and progress counters.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'tabular',
              label: 'Tabular Mono (Default)',
              sub: 'JetBrains Mono — Crystal clear at any size',
              preview: '25:00 • 120 Coins • 25m',
              style: { fontFamily: 'var(--font-number-mono), monospace' },
            },
            {
              id: 'clean',
              label: 'Modern Sans',
              sub: 'Inter — Clean, high-legibility numerals',
              preview: '25:00 • 120 Coins • 25m',
              style: { fontFamily: 'var(--font-sans), sans-serif' },
            },
            {
              id: 'silkscreen',
              label: 'Silkscreen Retro',
              sub: 'Classic 8-bit arcade clock style',
              preview: '25:00 • 120 Coins • 25m',
              style: { fontFamily: 'var(--font-number-silkscreen), monospace' },
            },
            {
              id: 'pixel',
              label: 'Pixelify Sans',
              sub: 'Stylized game display font',
              preview: '25:00 • 120 Coins • 25m',
              style: { fontFamily: 'var(--font-pixel), monospace' },
            },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setNumberFont(f.id as 'tabular' | 'clean' | 'silkscreen' | 'pixel')}
              className={`p-3 text-left border-2 rounded-xs transition-all cursor-pointer ${
                numberFont === f.id
                  ? 'bg-white border-[#E3B341] shadow-xs ring-2 ring-[#E3B341]'
                  : 'bg-[#FAF6ED] border-[#D5C7AF] hover:bg-[#F3EAD7]'
              }`}
            >
              <div className="font-sans text-xs font-bold text-[#2B2118] flex items-center justify-between mb-1">
                <span>{f.label}</span>
                {numberFont === f.id && (
                  <span className="text-[#326122] text-[10px] bg-[#EAF3E6] px-1 py-0.2 border border-[#5FA244] rounded-xs font-bold uppercase tracking-wider">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#6B5A49] mb-2">{f.sub}</div>
              <div
                style={f.style}
                className="text-xs text-[#2B2118] bg-[#F3EAD7] p-2 border border-[#CDBE9F] rounded-xs font-bold tracking-wide"
              >
                {f.preview}
              </div>
            </button>
          ))}
        </div>
      </PixelPanel>

      {/* Sound & Motion Preferences */}
      <PixelPanel variant="parchment" title="Audio & Motion Accessibility">
        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-[#D5C7AF] rounded-xs">
            <div className="flex items-center gap-3">
              <IconSound muted={!soundEnabled} size={20} />
              <div>
                <div className="font-sans text-xs font-bold text-[#2B2118]">
                  Island Music & 8-Bit Sound Effects
                </div>
                <div className="text-[11px] text-[#6B5A49]">
                  Looped island ambience plus tactile clicks and game sounds (off by default).
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#C7C9CC] peer-focus:outline-none rounded-xs peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#8A8D91] after:border after:rounded-xs after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5FA244]"></div>
            </label>
          </div>

          {/* Volume slider if enabled */}
          {soundEnabled && (
            <div className="p-3 bg-white border border-[#D5C7AF] rounded-xs flex items-center justify-between gap-4">
              <span className="font-sans text-xs font-semibold text-[#2B2118]">
                Audio Volume: {Math.round(soundVolume * 100)}%
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="accent-[#5FA244] w-48 cursor-pointer"
              />
            </div>
          )}

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-[#D5C7AF] rounded-xs">
            <div>
              <div className="font-sans text-xs font-bold text-[#2B2118]">
                Reduced Motion Mode
              </div>
              <div className="text-[11px] text-[#6B5A49]">
                Pauses floating island bobbing and background cloud animations.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#C7C9CC] peer-focus:outline-none rounded-xs peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#8A8D91] after:border after:rounded-xs after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5FA244]"></div>
            </label>
          </div>
        </div>
      </PixelPanel>

      {/* Focus Timer Pomodoro Customization */}
      <PixelPanel variant="parchment" title="Focus Timer Durations (Minutes)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Focus Session (Default 25m)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={timerSettings.focus}
              onChange={(e) =>
                setTimerSettings({
                  ...timerSettings,
                  focus: parseInt(e.target.value, 10) || 25,
                })
              }
              className="w-full pixel-input text-xs text-[#2B2118]"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Short Break (Default 5m)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={timerSettings.shortBreak}
              onChange={(e) =>
                setTimerSettings({
                  ...timerSettings,
                  shortBreak: parseInt(e.target.value, 10) || 5,
                })
              }
              className="w-full pixel-input text-xs text-[#2B2118]"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Long Break (Default 15m)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={timerSettings.longBreak}
              onChange={(e) =>
                setTimerSettings({
                  ...timerSettings,
                  longBreak: parseInt(e.target.value, 10) || 15,
                })
              }
              className="w-full pixel-input text-xs text-[#2B2118]"
            />
          </div>
        </div>
      </PixelPanel>

      {/* Data Export / Import & Reset */}
      <PixelPanel variant="parchment" title="Data Persistence & Backup (JSON)">
        <p className="text-xs text-[#5A4D3F] mb-4">
          All data is stored directly in your browser&apos;s localStorage. You can export a JSON backup at any time or restore a previous sanctuary.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <PixelButton variant="primary" size="md" onClick={handleExportFile}>
            ⬇ Export Island JSON
          </PixelButton>

          <PixelButton
            variant="danger"
            size="md"
            onClick={() => {
              if (resetConfirm) {
                resetAllData();
                setResetConfirm(false);
              } else {
                setResetConfirm(true);
              }
            }}
          >
            {resetConfirm ? '⚠️ Click to Confirm Reset' : '↺ Reset Demo Island'}
          </PixelButton>
        </div>

        {/* Import JSON Area */}
        <div className="pt-3 border-t border-[#D5C7AF]">
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Import JSON Data
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder="Paste exported SkyDome JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="flex-1 pixel-input text-xs text-[#2B2118] bg-white"
            />
            <PixelButton
              variant="stone"
              size="md"
              onClick={handleImportSubmit}
              disabled={!importText.trim()}
              className="shrink-0"
            >
              Restore
            </PixelButton>
          </div>
          {importStatus && (
            <p className="text-xs font-sans font-medium mt-2 text-[#326122]">{importStatus}</p>
          )}
        </div>
      </PixelPanel>
    </div>
  );
};
