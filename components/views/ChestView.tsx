'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useSkyDoStore, getTodayDateString } from '../../store/useSkyDoStore';
import { ChestRewardResult, MiningBlockType } from '../../lib/types';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import {
  IconChest,
  IconCoin,
  IconSparkle,
  IconCheck,
  IconOre,
  IconCampfire,
} from '../icons/PixelIcons';

const STREAK_MILESTONES = [
  { day: 1, coins: 35, xp: 20, label: 'Day 1', perk: 'Starter Bounty' },
  { day: 2, coins: 50, xp: 30, label: 'Day 2', perk: '+15 Coins bonus' },
  { day: 3, coins: 70, xp: 45, ore: 'stone' as MiningBlockType, oreCount: 2, label: 'Day 3', perk: '+2 Cobblestone' },
  { day: 4, coins: 95, xp: 60, ore: 'iron' as MiningBlockType, oreCount: 1, label: 'Day 4', perk: '+1 Iron Ore' },
  { day: 5, coins: 130, xp: 80, ore: 'gold' as MiningBlockType, oreCount: 1, label: 'Day 5', perk: '+1 Gold Ore' },
  { day: 6, coins: 175, xp: 110, ore: 'diamond' as MiningBlockType, oreCount: 1, label: 'Day 6', perk: '+1 Diamond Ore' },
  { day: 7, coins: 250, xp: 150, ore: 'diamond' as MiningBlockType, oreCount: 2, label: 'Day 7+', perk: '👑 Jackpot +2 Diamond' },
];

export const ChestView: React.FC = () => {
  const coins = useSkyDoStore((state) => state.coins);
  const shopItems = useSkyDoStore((state) => state.shopItems);
  const dailyChest = useSkyDoStore((state) => state.dailyChest);
  const buyShopItem = useSkyDoStore((state) => state.buyShopItem);
  const equipShopItem = useSkyDoStore((state) => state.equipShopItem);
  const openChestReward = useSkyDoStore((state) => state.openChestReward);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  const [isOpening, setIsOpening] = useState(false);
  const [chestLoot, setChestLoot] = useState<ChestRewardResult | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const today = getTodayDateString();
  const isClaimedToday = dailyChest?.lastClaimDate === today;
  const currentStreak = dailyChest?.claimStreak || 0;

  // Real-time Countdown ticker to midnight reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilReset(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChest = () => {
    if (isOpening || isClaimedToday) return;
    setIsOpening(true);

    const result = openChestReward();
    if (!result || result.alreadyClaimed) {
      setIsOpening(false);
      return;
    }

    if (!reducedMotion) {
      try {
        confetti({
          particleCount: 45,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#E3B341', '#5FA244', '#FAF6ED', '#D97736', '#4AA3B5'],
          shapes: ['square'],
          scalar: 0.9,
        });
      } catch {
        // Fallback
      }
    }

    setTimeout(() => {
      setChestLoot(result);
      setIsOpening(false);
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pixel-panel-parchment p-5 border-b-4 border-[#C8B896] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconChest size={24} />
            Treasure Vault & Daily Mystery Crate
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Claim daily mystery bounties, maintain unbroken login streaks, and shop architectural island upgrades.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2.5">
          <div className="pixel-slot p-2.5 px-3 flex items-center gap-2">
            <IconCampfire size={18} />
            <div>
              <div className="text-[10px] text-[#C7C9CC] font-sans font-bold uppercase tracking-wider">CHEST STREAK</div>
              <div className="text-sm font-sans font-bold text-[#F4EFE6]">
                <span className="font-number">{currentStreak}</span> Days
              </div>
            </div>
          </div>

          <div className="pixel-slot p-2.5 px-3 flex items-center gap-2">
            <IconCoin size={20} />
            <div>
              <div className="text-[10px] text-[#C7C9CC] font-sans font-bold uppercase tracking-wider">COIN PURSE</div>
              <div className="text-sm font-number font-bold text-[#E3B341]">
                {coins}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Daily Bounty Chest Arena */}
      <div className="pixel-panel-parchment p-6 sm:p-8 border-2 border-[#D5C7AF] flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Status Ribbon Tag */}
        <div className="mb-2">
          {isClaimedToday ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF3E6] border border-[#5FA244] text-[#326122] font-sans text-xs font-bold uppercase tracking-wider rounded-xs shadow-xs">
              <IconCheck size={14} />
              CLAIMED TODAY • RESETS IN <span className="font-number">{timeUntilReset}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E3B341] border border-[#99701A] text-[#2B2118] font-sans text-xs font-bold uppercase tracking-wider rounded-xs animate-pulse shadow-xs">
              ✨ DAILY CRATE READY TO OPEN
            </span>
          )}
        </div>

        <h3 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold mb-1">
          Daily Mystery Supply Crate
        </h3>
        <p className="text-xs sm:text-sm text-[#5A4D3F] mb-6 max-w-md">
          {isClaimedToday
            ? 'You have collected today\'s supply drop! Return after midnight for the next tier bounty.'
            : 'Crack open your daily supply crate to compound consecutive streak rewards, bonus ores, and coins.'}
        </p>

        {/* Chest SVG with Animated Opening / Closed / Claimed State */}
        <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className={`w-32 h-32 crisp-pixel transition-transform duration-300 ${
              isOpening && !reducedMotion
                ? 'scale-110 -rotate-2'
                : !isClaimedToday && !reducedMotion
                ? 'hover:scale-105 cursor-pointer'
                : ''
            }`}
            onClick={!isClaimedToday ? handleOpenChest : undefined}
          >
            {/* Chest Shadow */}
            <rect x="15" y="75" width="70" height="8" fill="#2B2118" opacity="0.15" />

            {/* Chest Base */}
            <rect x="20" y="42" width="60" height="35" fill="#8B5A2B" />
            <rect x="20" y="42" width="6" height="35" fill="#6B4A2B" />
            <rect x="74" y="42" width="6" height="35" fill="#5E3B1C" />
            <rect x="26" y="73" width="48" height="4" fill="#5E3B1C" />

            {/* Iron bands */}
            <rect x="20" y="52" width="60" height="3" fill="#4B4E52" />
            <rect x="20" y="66" width="60" height="3" fill="#4B4E52" />

            {/* Glowing Treasure Interior when opened */}
            {(isClaimedToday || isOpening || chestLoot) && (
              <g className="animate-pulse">
                <rect x="24" y="42" width="52" height="10" fill="#E3B341" opacity="0.9" />
                <rect x="28" y="40" width="44" height="6" fill="#F4EFE6" opacity="0.75" />
              </g>
            )}

            {/* Chest Lid (rotates open when claimed or opening) */}
            <g
              className="origin-[20px_42px] transition-transform duration-500 ease-out"
              style={{
                transform:
                  isOpening || isClaimedToday || chestLoot
                    ? 'rotate(-32deg) translateY(-10px)'
                    : 'none',
              }}
            >
              <rect x="18" y="24" width="64" height="20" fill="#B98E55" />
              <rect x="18" y="24" width="6" height="20" fill="#DEB982" />
              <rect x="76" y="24" width="6" height="20" fill="#6B4A2B" />
              <rect x="24" y="24" width="52" height="4" fill="#DEB982" />
              <rect x="18" y="32" width="64" height="3" fill="#4B4E52" />
            </g>

            {/* Gold Lock Latch */}
            <rect x="46" y="38" width="8" height="12" fill="#E3B341" />
            <rect x="48" y="42" width="4" height="4" fill="#2B2118" />
          </svg>
        </div>

        {/* Loot Award Notification Dialog */}
        {chestLoot && (
          <div className="mb-6 p-4 bg-[#FAF6ED] border-4 border-[#5FA244] rounded-xs shadow-xl animate-fade-in max-w-md w-full text-center">
            <div className="inline-block px-3 py-0.5 bg-[#5FA244] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xs mb-2">
              🎉 CRATE REWARD HARVESTED!
            </div>
            <div className="text-sm font-sans font-bold text-[#2B2118] mb-3">
              🔥 Day <span className="font-number">{chestLoot.streakDay}</span> Daily Streak Bonus Claimed!
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-xs font-sans">
              <div className="p-2 bg-[#EAF3E6] border border-[#B8DCAB] rounded-xs flex flex-col items-center justify-center">
                <IconCoin size={18} className="mb-1" />
                <span className="text-[#875F0E] font-bold font-number">+{chestLoot.coins} Coins</span>
              </div>
              <div className="p-2 bg-[#FAF6ED] border border-[#D5C7AF] rounded-xs flex flex-col items-center justify-center">
                <IconSparkle size={18} className="mb-1" />
                <span className="text-[#326122] font-bold font-number">+{chestLoot.xp} Island XP</span>
              </div>
              {chestLoot.bonusOre && (
                <div className="p-2 bg-[#FAF6ED] border border-[#E3B341] rounded-xs flex flex-col items-center justify-center col-span-2 sm:col-span-1">
                  <IconOre type={chestLoot.bonusOre} size={18} className="mb-1" />
                  <span className="text-[#2B2118] font-bold capitalize">
                    +{chestLoot.bonusOreCount}x {chestLoot.bonusOre}
                  </span>
                </div>
              )}
            </div>

            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => setChestLoot(null)}
              className="w-full text-xs font-bold"
            >
              Claim & Continue
            </PixelButton>
          </div>
        )}

        {/* Open Button or Cooldown State */}
        <div className="w-full max-w-sm flex flex-col items-center">
          {isClaimedToday ? (
            <div className="w-full space-y-2">
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 bg-[#EAE0CA] text-[#7A7368] font-sans text-xs font-bold uppercase tracking-wider border-2 border-[#CDBE9F] rounded-xs cursor-not-allowed text-center opacity-90 shadow-inner"
              >
                ✓ Crate Claimed for Today
              </button>
              <div className="text-xs font-sans text-[#5A4D3F] flex items-center justify-center gap-1.5">
                <span>Next crate unlocks in:</span>
                <span className="font-number font-bold text-[#B3392F] bg-black/5 px-2 py-0.5 rounded-xs">
                  {timeUntilReset}
                </span>
              </div>
            </div>
          ) : (
            <PixelButton
              variant="primary"
              size="lg"
              onClick={handleOpenChest}
              disabled={isOpening}
              className="w-full min-w-[200px] text-sm font-bold"
            >
              {isOpening ? 'Cracking Crate...' : '🎁 Open Daily Supply Crate'}
            </PixelButton>
          )}
        </div>

        {/* 7-Day Streak Rewards Track */}
        <div className="w-full max-w-3xl mt-8 pt-6 border-t-2 border-[#D5C7AF]">
          <div className="flex items-center justify-between mb-3 text-left">
            <div>
              <h4 className="font-pixel text-xs sm:text-sm font-bold text-[#2B2118] flex items-center gap-1.5">
                <IconSparkle size={14} />
                7-Day Daily Claim Streak Track
              </h4>
              <p className="text-[11px] text-[#5A4D3F]">
                Claim your mystery crate every day to advance through increasingly rich loot tiers.
              </p>
            </div>
            <span className="text-xs font-sans font-bold text-[#875F0E] px-2 py-0.5 bg-[#FAF6ED] border border-[#CDBE9F] rounded-xs">
              Streak: <span className="font-number font-bold">{currentStreak}</span>d
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STREAK_MILESTONES.map((m) => {
              const isPassed = currentStreak >= m.day;
              const isCurrent =
                !isClaimedToday
                  ? (currentStreak === 0 && m.day === 1) || currentStreak + 1 === m.day
                  : currentStreak === m.day;

              return (
                <div
                  key={m.day}
                  className={`p-2.5 rounded-xs border-2 text-center transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#FAF6ED] border-[#E3B341] shadow-md scale-102 ring-2 ring-[#E3B341]/40'
                      : isPassed
                      ? 'bg-[#EAF3E6] border-[#5FA244] text-[#326122] opacity-85'
                      : 'bg-[#EAE0CA]/70 border-[#CDBE9F] text-[#7A7368]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans font-bold mb-1">
                    <span>{m.label}</span>
                    {isPassed && <span className="text-[#326122] font-bold">✓</span>}
                  </div>

                  <div className="my-1.5 flex flex-col items-center justify-center min-h-[36px]">
                    <div className="flex items-center gap-1 text-xs font-sans font-bold">
                      <IconCoin size={12} />
                      <span className="font-number">{m.coins}</span>
                    </div>
                    <div className="text-[11px] font-sans text-[#5A4D3F]">
                      +<span className="font-number">{m.xp}</span> XP
                    </div>
                  </div>

                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider py-0.5 px-1 bg-black/5 rounded-xs truncate">
                    {m.perk}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sanctuary Bazaar Catalog */}
      <div>
        <h3 className="font-pixel text-lg text-[#2B2118] font-bold mb-3 flex items-center gap-2">
          <span>Sanctuary Bazaar Catalog</span>
          <span className="text-xs text-[#5A4D3F] font-sans font-normal">
            (Spend productivity coins on island cosmetics)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.map((item) => {
            const canAfford = coins >= item.price;
            return (
              <PixelPanel
                key={item.id}
                variant="parchment"
                title={item.name}
                className="border-2 border-[#D5C7AF] hover:border-[#B5A586] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-sans uppercase px-1.5 py-0.2 bg-[#EAE0CA] text-[#6B5A49] rounded-xs font-bold tracking-wider">
                      {item.category}
                    </span>
                    {item.unlocked && (
                      <span className="text-[11px] font-sans px-1.5 py-0.2 bg-[#EAF3E6] text-[#326122] border border-[#5FA244] rounded-xs font-bold tracking-wider">
                        {item.equipped ? 'EQUIPPED' : 'OWNED'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5A4D3F] mb-4 min-h-[32px]">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D5C7AF]">
                  <div className="flex items-center gap-1 font-sans text-xs font-bold text-[#875F0E]">
                    <IconCoin size={14} />
                    <span>
                      {item.price === 0 ? (
                        'FREE'
                      ) : (
                        <>
                          <span className="font-number">{item.price}</span> Coins
                        </>
                      )}
                    </span>
                  </div>

                  {item.unlocked ? (
                    <PixelButton
                      variant={item.equipped ? 'stone' : 'primary'}
                      size="sm"
                      onClick={() => equipShopItem(item.id)}
                      className="text-xs"
                    >
                      {item.equipped ? 'Unequip' : 'Equip'}
                    </PixelButton>
                  ) : (
                    <PixelButton
                      variant="primary"
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => buyShopItem(item.id)}
                      className="text-xs"
                    >
                      Buy Item
                    </PixelButton>
                  )}
                </div>
              </PixelPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
};
