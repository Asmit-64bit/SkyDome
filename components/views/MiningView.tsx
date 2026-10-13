'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { MiningBlockType, MiningTimerMode } from '../../lib/types';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import { IconPickaxe, IconOre, IconSparkle, IconCoin } from '../icons/PixelIcons';
import { MiningCanvas3D } from '../mining/MiningCanvas3D';
import { ORE_PALETTES } from '../../lib/textures';

export const MiningView: React.FC = () => {
  const [is3DBlock, setIs3DBlock] = useState(true);
  const [hitFeedback, setHitFeedback] = useState<{ id: number; text: string }[]>([]);
  const [isWobbling, setIsWobbling] = useState(false);

  const mining = useSkyDoStore((state) => state.mining);
  const startMiningTimer = useSkyDoStore((state) => state.startMiningTimer);
  const pauseMiningTimer = useSkyDoStore((state) => state.pauseMiningTimer);
  const resumeMiningTimer = useSkyDoStore((state) => state.resumeMiningTimer);
  const resetMiningTimer = useSkyDoStore((state) => state.resetMiningTimer);
  const clickMineBlock = useSkyDoStore((state) => state.clickMineBlock);
  const setMiningMode = useSkyDoStore((state) => state.setMiningMode);
  const setMiningBlock = useSkyDoStore((state) => state.setMiningBlock);
  const linkMiningQuest = useSkyDoStore((state) => state.linkMiningQuest);
  const completeLinkedMiningQuest = useSkyDoStore((state) => state.completeLinkedMiningQuest);
  const quests = useSkyDoStore((state) => state.quests);
  const timerSettings = useSkyDoStore((state) => state.timerSettings);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  // Trigger celebration confetti when mining session completes
  useEffect(() => {
    if (mining.state === 'finished' && !reducedMotion) {
      try {
        confetti({
          particleCount: 45,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#5FA244', '#E3B341', '#4AA3B5', '#FAF6ED'],
          shapes: ['square'],
          scalar: 0.9,
        });
      } catch {}
    }
  }, [mining.state, reducedMotion]);

  const handleBlockClick = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 140);

    const res = clickMineBlock();
    if (res.hit) {
      const id = Date.now();
      setHitFeedback((prev) => [
        ...prev.slice(-3),
        { id, text: res.bonusSecs > 0 ? '+1s ⚒️' : 'Hit!' },
      ]);
      setTimeout(() => {
        setHitFeedback((prev) => prev.filter((item) => item.id !== id));
      }, 700);

      if (res.finished && !reducedMotion) {
        try {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#E3B341', '#4AA3B5', '#5FA244', '#BAC0C7'],
            shapes: ['square'],
            scalar: 0.9,
          });
        } catch {}
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeQuest = quests.find((q) => q.id === mining.linkedQuestId);

  // SVG Fracture Crack Overlays for 5 stages
  const renderCracks = (stage: number) => {
    if (stage === 0) return null;
    return (
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
        stroke="#18191A"
        strokeWidth="3"
        strokeLinecap="square"
      >
        {stage >= 1 && (
          <path d="M 50 10 L 46 28 L 54 42 L 48 56" />
        )}
        {stage >= 2 && (
          <path d="M 48 56 L 30 68 L 22 84 M 54 42 L 72 48 L 84 62" />
        )}
        {stage >= 3 && (
          <path d="M 30 68 L 44 82 L 48 94 M 72 48 L 78 30 L 90 20" />
        )}
        {stage >= 4 && (
          <path d="M 46 28 L 24 34 L 10 32 M 54 42 L 36 48 L 32 60" />
        )}
        {stage >= 5 && (
          <path d="M 10 32 L 6 70 M 90 20 L 92 78 L 70 88 L 48 94" />
        )}
      </svg>
    );
  };

  const blockColors: Record<MiningBlockType, { bg: string; border: string; gem: string; name: string }> = {
    stone: { bg: '#8A8D91', border: '#C7C9CC', gem: '#4B4E52', name: 'Cobblestone' },
    iron: { bg: '#8A8D91', border: '#C7C9CC', gem: '#D4AF87', name: 'Iron Ore' },
    gold: { bg: '#8A8D91', border: '#C7C9CC', gem: '#E3B341', name: 'Gold Ore' },
    diamond: { bg: '#8A8D91', border: '#C7C9CC', gem: '#4AA3B5', name: 'Diamond Ore' },
  };

  const currentConfig = blockColors[mining.currentBlock];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pixel-panel-parchment p-4 border-b-4 border-[#C8B896] w-full min-w-0">
        <div className="min-w-0">
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconPickaxe size={24} />
            Deep Focus Mining (Pomodoro)
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Carve deep focus sessions into the bedrock of your day. Each session cracks raw ores into experience.
          </p>
        </div>

        {/* Linked Quest Pill */}
        <div className="w-full sm:w-auto flex items-center gap-2 bg-[#EFE6D2] p-2 border border-[#CDBE9F] rounded-xs text-xs font-sans font-medium min-w-0 max-w-full">
          <span className="text-[#6B5A49] shrink-0">Linked Quest:</span>
          <select
            value={mining.linkedQuestId || ''}
            onChange={(e) => linkMiningQuest(e.target.value || undefined)}
            className="flex-1 min-w-0 max-w-full sm:max-w-[220px] bg-white border border-[#CDBE9F] px-2 py-1 text-xs rounded-xs text-[#2B2118] truncate cursor-pointer"
          >
            <option value="">-- No Quest Linked --</option>
            {quests
              .filter((q) => !q.completed)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Main Mining Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        {/* Left Column: Pomodoro Block Arena */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center pixel-panel-parchment p-4 sm:p-8 lg:p-10 border-2 border-[#D5C7AF] w-full min-w-0">
          {/* Mode Tabs (25m Focus / 5m Break / 15m Long Break) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full max-w-md mb-6 sm:mb-8 bg-[#EAE0CA] p-1.5 border border-[#CDBE9F] rounded-xs">
            <button
              type="button"
              onClick={() => setMiningMode('focus')}
              className={`py-2 px-1 text-xs font-sans font-bold rounded-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
                mining.mode === 'focus'
                  ? 'bg-[#E3B341] text-[#2B2118] border-2 border-[#99701A] shadow-xs'
                  : 'text-[#6B5A49] hover:bg-[#FAF6ED]'
              }`}
            >
              <span className="truncate">⚒️ Focus</span>
              <span className="font-number font-bold text-[11px] px-1.5 py-0.2 rounded-xs bg-black/10 shrink-0">
                {timerSettings.focus}m
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMiningMode('short_break')}
              className={`py-2 px-1 text-xs font-sans font-bold rounded-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
                mining.mode === 'short_break'
                  ? 'bg-[#5FA244] text-white border-2 border-[#3F7A2E] shadow-xs'
                  : 'text-[#6B5A49] hover:bg-[#FAF6ED]'
              }`}
            >
              <span className="truncate">☕ Rest</span>
              <span className="font-number font-bold text-[11px] px-1.5 py-0.2 rounded-xs bg-black/15 shrink-0">
                {timerSettings.shortBreak}m
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMiningMode('long_break')}
              className={`py-2 px-1 text-xs font-sans font-bold rounded-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
                mining.mode === 'long_break'
                  ? 'bg-[#4AA3B5] text-white border-2 border-[#246370] shadow-xs'
                  : 'text-[#6B5A49] hover:bg-[#FAF6ED]'
              }`}
            >
              <span className="truncate">🌊 Break</span>
              <span className="font-number font-bold text-[11px] px-1.5 py-0.2 rounded-xs bg-black/15 shrink-0">
                {timerSettings.longBreak}m
              </span>
            </button>
          </div>

          {/* 3D / 2D Block Mode Toggle */}
          <div className="flex justify-end w-full max-w-sm mb-2">
            <button
              type="button"
              onClick={() => setIs3DBlock(!is3DBlock)}
              className="px-2.5 py-0.5 bg-[#EAE0CA] text-[#2B2118] border border-[#CDBE9F] text-xs font-sans font-bold rounded-xs hover:bg-[#FAF6ED] transition-all"
            >
              {is3DBlock ? '🎲 3D Voxel Block' : '🖼️ 2D Classic'}
            </button>
          </div>

          {/* Interactive Cracked Mining Block Stage */}
          <div
            className={`relative w-56 h-56 sm:w-64 sm:h-64 mb-6 flex items-center justify-center select-none ${
              isWobbling ? 'scale-95 transition-transform duration-75' : 'transition-transform duration-150'
            }`}
          >
            {/* Floating hit spark text */}
            {hitFeedback.map((h) => (
              <div
                key={h.id}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-sans text-xs sm:text-sm font-bold text-[#E3B341] px-2 py-0.5 bg-black/75 rounded-xs animate-bounce shadow-md z-30"
              >
                {h.text}
              </div>
            ))}

            {is3DBlock ? (
              <div className="w-full h-full border-2 border-[#C8B896] bg-[#FAF6ED]/50 rounded-xs shadow-inner overflow-hidden relative">
                <MiningCanvas3D
                  currentBlock={mining.currentBlock}
                  crackStage={mining.crackStage}
                  isRunning={mining.state === 'running'}
                  onBlockClick={handleBlockClick}
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 text-white font-sans font-bold text-[10px] uppercase tracking-wider rounded-xs">
                  Fracture {mining.crackStage}/5
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/40 text-[#FAF6ED] font-sans font-bold text-[10px] uppercase tracking-wider rounded-xs pointer-events-none">
                  {mining.state === 'running' ? 'Click to Strike Block' : 'Click Block to Start'}
                </div>
              </div>
            ) : (
              <div
                onClick={handleBlockClick}
                className="relative w-48 h-48 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {/* 2D Defined Textured Block */}
                <div
                  className="relative w-36 h-36 sm:w-44 sm:h-44 border-4 shadow-xl flex items-center justify-center overflow-hidden transition-all bg-[#8E9196]"
                  style={{
                    borderTopColor: '#B8BCC2',
                    borderLeftColor: '#B8BCC2',
                    borderBottomColor: '#5E6166',
                    borderRightColor: '#5E6166',
                  }}
                >
                  {/* Cobblestone texture patches */}
                  <div className="absolute top-2 left-2 w-12 h-8 bg-[#A8ACB2]/50 border-t-2 border-l-2 border-[#D3D7DC]/70 border-b border-r border-[#6C6F74]/40" />
                  <div className="absolute top-9 right-2 w-14 h-9 bg-[#808388]/40 border-t-2 border-l-2 border-[#BAC0C7]/50 border-b border-r border-[#5E6166]/50" />
                  <div className="absolute bottom-2 left-3 w-16 h-10 bg-[#93969B]/50 border-t-2 border-l-2 border-[#C7C9CC]/60 border-b border-r border-[#6C6F74]/40" />
                  <div className="absolute bottom-3 right-3 w-10 h-9 bg-[#A8ACB2]/40 border-t-2 border-l-2 border-[#BAC0C7]/50 border-b border-r border-[#6C6F74]/40" />

                  {/* Gem clusters only rendered for iron, gold, and diamond */}
                  {mining.currentBlock !== 'stone' && ORE_PALETTES[mining.currentBlock] && (
                    <>
                      {/* Gem Cluster 1 (Top-Left) */}
                      <div
                        className="absolute top-5 left-5 w-6 h-5 p-0.5 border"
                        style={{
                          backgroundColor: ORE_PALETTES[mining.currentBlock].gemDark,
                          borderColor: ORE_PALETTES[mining.currentBlock].gemSocket,
                        }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemBase }}
                        >
                          <div
                            className="absolute top-0 left-0 w-1.5 h-1.5"
                            style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemLight }}
                          />
                        </div>
                      </div>

                      {/* Gem Cluster 2 (Top-Right) */}
                      <div
                        className="absolute top-12 right-6 w-7 h-6 p-0.5 border"
                        style={{
                          backgroundColor: ORE_PALETTES[mining.currentBlock].gemDark,
                          borderColor: ORE_PALETTES[mining.currentBlock].gemSocket,
                        }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemBase }}
                        >
                          <div
                            className="absolute top-0 left-0 w-2 h-2"
                            style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemLight }}
                          />
                        </div>
                      </div>

                      {/* Gem Cluster 3 (Bottom-Left) */}
                      <div
                        className="absolute bottom-5 left-8 w-7 h-5 p-0.5 border"
                        style={{
                          backgroundColor: ORE_PALETTES[mining.currentBlock].gemDark,
                          borderColor: ORE_PALETTES[mining.currentBlock].gemSocket,
                        }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemBase }}
                        >
                          <div
                            className="absolute top-0 left-0 w-1.5 h-1.5"
                            style={{ backgroundColor: ORE_PALETTES[mining.currentBlock].gemLight }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {renderCracks(mining.crackStage)}
                  <div className="relative z-10 px-2 py-1 bg-black/60 text-white font-sans font-bold text-xs rounded-xs">
                    Fracture {mining.crackStage}/5
                  </div>
                </div>

                {/* Pickaxe swinging near block when running */}
                <div
                  className={`absolute -right-4 -top-4 w-16 h-16 origin-bottom-left pointer-events-none ${
                    mining.state === 'running' && !reducedMotion ? 'animate-pickaxe' : ''
                  }`}
                >
                  <IconPickaxe size={54} />
                </div>
              </div>
            )}
          </div>

          {/* Big Digital Minecraft Clock Display */}
          <div className="font-number text-4xl sm:text-6xl text-[#2B2118] font-bold tracking-wider mb-6 bg-[#FAF6ED] px-4 sm:px-8 py-2.5 border-2 border-[#CDBE9F] rounded-xs shadow-inner max-w-full text-center">
            {formatTime(mining.secondsRemaining)}
          </div>

          {/* Active Quest indicator if linked */}
          {activeQuest && (
            <div className="text-xs font-sans text-[#5A4D3F] mb-6 flex items-center justify-center gap-1.5 bg-[#EAE0CA] px-3 py-1.5 border border-[#CDBE9F] rounded-xs w-full max-w-sm text-center">
              <span className="shrink-0">🎯 Mining for:</span>
              <span className="font-semibold text-[#2B2118] truncate">
                {activeQuest.title}
              </span>
            </div>
          )}

          {/* Completed Session Celebration Card */}
          {mining.state === 'finished' && (
            <div className="w-full max-w-md p-4 sm:p-5 bg-[#FAF6ED] border-4 border-[#5FA244] rounded-xs shadow-lg mb-6 animate-fade-in text-center">
              <div className="inline-block px-3 py-1 bg-[#5FA244] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xs mb-2">
                🎉 FOCUS MINING COMPLETE!
              </div>
              <h3 className="font-pixel text-lg sm:text-xl font-bold text-[#2B2118] mb-1">
                {mining.mode === 'focus' ? `Mined 1x ${currentConfig.name}!` : 'Rest Break Complete!'}
              </h3>
              <p className="text-xs text-[#5A4D3F] mb-4">
                {mining.mode === 'focus'
                  ? `Raw ore extracted into your stockpile. Gained +${timerSettings.focus * 2 + (mining.currentBlock === 'diamond' ? 50 : mining.currentBlock === 'gold' ? 35 : mining.currentBlock === 'iron' ? 25 : 15)} Mining XP and +${Math.round(timerSettings.focus * 1.5)} Coins!`
                  : 'Your focus is replenished. Ready to strike the bedrock again?'}
              </p>

              {/* Linked Quest Completion Button if present */}
              {activeQuest && !activeQuest.completed && (
                <div className="p-3 bg-[#EAF3E6] border border-[#5FA244] rounded-xs mb-4 text-left">
                  <div className="text-[11px] font-sans text-[#326122] font-bold uppercase tracking-wider mb-1">
                    LINKED OBJECTIVE READY:
                  </div>
                  <div className="text-xs font-sans text-[#2B2118] font-semibold mb-2">
                    {activeQuest.title}
                  </div>
                  <PixelButton
                    variant="primary"
                    size="sm"
                    onClick={completeLinkedMiningQuest}
                    className="w-full text-xs"
                  >
                    ✓ Complete Objective & Claim +{activeQuest.xpReward} XP
                  </PixelButton>
                </div>
              )}

              {/* Action Buttons: Short Break / Mine Again */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                {mining.mode === 'focus' ? (
                  <>
                    <PixelButton
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setMiningMode('short_break');
                        startMiningTimer();
                      }}
                      className="w-full sm:w-auto min-w-[130px]"
                    >
                      ☕ Take 5m Break
                    </PixelButton>
                    <PixelButton
                      variant="wood"
                      size="md"
                      onClick={() => {
                        resetMiningTimer();
                        startMiningTimer();
                      }}
                      className="w-full sm:w-auto min-w-[130px]"
                    >
                      ⚒️ Mine Another
                    </PixelButton>
                  </>
                ) : (
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setMiningMode('focus');
                      startMiningTimer();
                    }}
                    className="w-full sm:w-auto min-w-[150px]"
                  >
                    ⚒️ Start Focus Session
                  </PixelButton>
                )}
              </div>
            </div>
          )}

          {/* Controls: Start / Pause / Reset */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
            {mining.state === 'running' ? (
              <PixelButton
                variant="wood"
                size="lg"
                onClick={pauseMiningTimer}
                className="min-w-[120px] sm:min-w-[130px]"
              >
                ⏸ Pause
              </PixelButton>
            ) : mining.state === 'paused' ? (
              <PixelButton
                variant="primary"
                size="lg"
                onClick={resumeMiningTimer}
                className="min-w-[120px] sm:min-w-[130px]"
              >
                ▶ Resume
              </PixelButton>
            ) : (
              <PixelButton
                variant="primary"
                size="lg"
                onClick={startMiningTimer}
                className="min-w-[130px] sm:min-w-[140px]"
              >
                ⚒️ Start Mining
              </PixelButton>
            )}

            <PixelButton
              variant="ghost"
              size="lg"
              onClick={resetMiningTimer}
              className="text-xs min-w-[90px]"
            >
              ↺ Reset
            </PixelButton>
          </div>
        </div>

        {/* Right Column: Ore Veins & Focus Stats */}
        <div className="lg:col-span-4 space-y-5">
          {/* Choose Ore Block Type */}
          <PixelPanel variant="parchment" title="Select Ore Target">
            <p className="text-xs text-[#5A4D3F] mb-3">
              Higher grade ores yield higher Mining XP upon completion.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['stone', 'iron', 'gold', 'diamond'] as MiningBlockType[]).map((block) => (
                <button
                  key={block}
                  type="button"
                  onClick={() => setMiningBlock(block)}
                  className={`p-2.5 flex items-center gap-2 border-2 rounded-xs transition-all cursor-pointer ${
                    mining.currentBlock === block
                      ? 'bg-[#FAF6ED] border-[#E3B341] shadow-xs'
                      : 'bg-[#EAE0CA] border-[#CDBE9F] hover:bg-[#F3EAD7]'
                  }`}
                >
                  <IconOre type={block} size={24} />
                  <div className="text-left">
                    <div className="text-xs font-sans font-bold text-[#2B2118] capitalize">
                      {block}
                    </div>
                    <div className="text-[10px] text-[#6B5A49] font-number font-semibold">
                      +{block === 'diamond' ? 50 : block === 'gold' ? 35 : block === 'iron' ? 25 : 15} XP
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </PixelPanel>

          {/* Ores Mined Chest Inventory */}
          <PixelPanel variant="parchment" title="Ore Stockpile">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="pixel-slot p-2 flex items-center gap-2">
                <IconOre type="stone" size={20} />
                <div>
                  <div className="text-[10px] text-[#C7C9CC] font-sans font-bold uppercase tracking-wider">STONE</div>
                  <div className="text-sm font-number font-bold text-white">
                    {mining.oresMined.stone}
                  </div>
                </div>
              </div>

              <div className="pixel-slot p-2 flex items-center gap-2">
                <IconOre type="iron" size={20} />
                <div>
                  <div className="text-[10px] text-[#D4AF87] font-sans font-bold uppercase tracking-wider">IRON</div>
                  <div className="text-sm font-number font-bold text-white">
                    {mining.oresMined.iron}
                  </div>
                </div>
              </div>

              <div className="pixel-slot p-2 flex items-center gap-2">
                <IconOre type="gold" size={20} />
                <div>
                  <div className="text-[10px] text-[#E3B341] font-sans font-bold uppercase tracking-wider">GOLD</div>
                  <div className="text-sm font-number font-bold text-white">
                    {mining.oresMined.gold}
                  </div>
                </div>
              </div>

              <div className="pixel-slot p-2 flex items-center gap-2">
                <IconOre type="diamond" size={20} />
                <div>
                  <div className="text-[10px] text-[#4AA3B5] font-sans font-bold uppercase tracking-wider">DIAMOND</div>
                  <div className="text-sm font-number font-bold text-white">
                    {mining.oresMined.diamond}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Focus Time */}
            <div className="p-2.5 bg-[#FAF6ED] border border-[#CDBE9F] rounded-xs flex items-center justify-between text-xs">
              <span className="text-[#6B5A49] font-sans font-bold text-xs uppercase tracking-wider">TOTAL TIME FOCUSED:</span>
              <span className="font-bold text-[#2B2118] font-number">
                {mining.totalFocusMinutesCompleted} mins ({(mining.totalFocusMinutesCompleted / 60).toFixed(1)} hrs)
              </span>
            </div>
          </PixelPanel>
        </div>
      </div>
    </div>
  );
};
