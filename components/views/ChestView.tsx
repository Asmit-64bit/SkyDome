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
  const theme = useSkyDoStore((state) => state.theme);
  const mining = useSkyDoStore((state) => state.mining);
  const islandLevel = useSkyDoStore((state) => state.islandLevel);
  const shopItems = useSkyDoStore((state) => state.shopItems);
  const dailyChest = useSkyDoStore((state) => state.dailyChest);
  const buyShopItem = useSkyDoStore((state) => state.buyShopItem);
  const equipShopItem = useSkyDoStore((state) => state.equipShopItem);
  const openChestReward = useSkyDoStore((state) => state.openChestReward);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  const [isOpening, setIsOpening] = useState(false);
  const [chestLoot, setChestLoot] = useState<ChestRewardResult | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [shopCategory, setShopCategory] = useState<string>('all');

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
        <div className="relative w-48 h-48 mb-4 flex items-center justify-center overflow-visible">
          <svg
            viewBox="0 0 100 115"
            className={`w-40 h-40 crisp-pixel overflow-visible transition-transform duration-300 ${
              isOpening && !reducedMotion
                ? 'scale-110 -rotate-2'
                : !isClaimedToday && !reducedMotion
                ? 'hover:scale-105 cursor-pointer'
                : ''
            }`}
            onClick={!isClaimedToday ? handleOpenChest : undefined}
          >
            {/* Ground Shadow */}
            <rect x="14" y="86" width="72" height="8" rx="2" fill="#2B2118" opacity="0.18" />

            {/* Open lid sits on the rear hinge line, behind the chest rim. */}
            {(isOpening || isClaimedToday || chestLoot) && (
              <g>
                <path d="M20 52 L80 52 L72 29 L28 29 Z" fill="#5E3B1C" />
                <path d="M24 49 L76 49 L69 33 L31 33 Z" fill="#9E6833" />
                <path d="M28 36 L72 36 L70 32 L30 32 Z" fill="#C59357" />
                <path d="M23 43 L77 43 L76 39 L24 39 Z" fill="#4B4E52" />
                <rect x="25" y="40" width="2" height="2" fill="#8A8D91" />
                <rect x="73" y="40" width="2" height="2" fill="#8A8D91" />
                <path d="M20 51 L80 51" stroke="#C59357" strokeWidth="2" />
              </g>
            )}

            {/* Chest Base (x: 20 to 80, y: 52 to 86) */}
            <rect x="20" y="52" width="60" height="34" fill="#8B5A2B" />
            <rect x="20" y="52" width="5" height="34" fill="#6B4A2B" />
            <rect x="75" y="52" width="5" height="34" fill="#5E3B1C" />
            <rect x="25" y="82" width="50" height="4" fill="#5E3B1C" />

            {/* Iron Bands across Base */}
            <rect x="20" y="62" width="60" height="4" fill="#4B4E52" />
            <rect x="20" y="74" width="60" height="4" fill="#4B4E52" />
            {/* Iron Rivets */}
            <rect x="21" y="63" width="2" height="2" fill="#8A8D91" />
            <rect x="42" y="63" width="2" height="2" fill="#8A8D91" />
            <rect x="56" y="63" width="2" height="2" fill="#8A8D91" />
            <rect x="77" y="63" width="2" height="2" fill="#8A8D91" />
            <rect x="21" y="75" width="2" height="2" fill="#8A8D91" />
            <rect x="42" y="75" width="2" height="2" fill="#8A8D91" />
            <rect x="56" y="75" width="2" height="2" fill="#8A8D91" />
            <rect x="77" y="75" width="2" height="2" fill="#8A8D91" />

            {/* Glowing Treasure Interior when opened */}
            {(isClaimedToday || isOpening || chestLoot) && (
              <g>
                {/* Dark Inner Well */}
                <rect x="25" y="52" width="50" height="10" fill="#321A0C" />
                {/* Glowing Gold Mound */}
                <rect x="27" y="51" width="46" height="9" fill="#E3B341" />
                <rect x="31" y="49" width="38" height="7" fill="#FFEB60" />
                <rect x="36" y="47" width="28" height="5" fill="#FFF8C4" className="animate-pulse" />
                {/* Sparkling Loot Gems */}
                <rect x="33" y="48" width="4" height="4" fill="#4AA3B5" />
                <rect x="44" y="46" width="4" height="4" fill="#5FA244" />
                <rect x="53" y="47" width="4" height="4" fill="#B3392F" />
                <rect x="63" y="48" width="3" height="3" fill="#E3B341" />
                {/* Radial Gold Aura */}
                <circle cx="50" cy="48" r="16" fill="#FFE57F" opacity="0.18" className="animate-ping" />
              </g>
            )}

            {/* Catch Plate on Base (aligned under latch) */}
            <rect x="47" y="52" width="6" height="4" fill="#B88B27" />
            <rect x="48" y="53" width="4" height="3" fill="#2B2118" />

            {/* Closed lid; the open pose above stays connected across the rear hinge. */}
            {!isOpening && !isClaimedToday && !chestLoot && <g>
              {/* Lid Wood (x: 18 to 82, y: 32 to 52) */}
              <rect x="18" y="32" width="64" height="20" fill="#9E6833" />
              <rect x="18" y="32" width="64" height="3" fill="#C59357" />
              <rect x="18" y="32" width="5" height="20" fill="#B88548" />
              <rect x="77" y="32" width="5" height="20" fill="#6B4A2B" />
              <rect x="18" y="49" width="64" height="3" fill="#5E3B1C" />

              {/* Iron Band across Lid */}
              <rect x="18" y="40" width="64" height="4" fill="#4B4E52" />
              {/* Iron Rivets on Lid */}
              <rect x="20" y="41" width="2" height="2" fill="#8A8D91" />
              <rect x="42" y="41" width="2" height="2" fill="#8A8D91" />
              <rect x="56" y="41" width="2" height="2" fill="#8A8D91" />
              <rect x="78" y="41" width="2" height="2" fill="#8A8D91" />

              {/* Gold Lock Latch (attached to the lid, lifts up with lid) */}
              <rect x="46" y="44" width="8" height="12" fill="#E3B341" />
              <rect x="46" y="44" width="8" height="2" fill="#FFE57F" />
              <rect x="48" y="49" width="4" height="4" fill="#2B2118" />
            </g>}
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
              <h4 className="font-sans font-bold text-sm text-[#2B2118] flex items-center gap-1.5">
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
        <h3 className={`font-pixel text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'night' || theme === 'galaxy' ? 'text-[#F4EFE6]' : 'text-[#2B2118]'}`}>
          <span>Sanctuary Bazaar Catalog</span>
          <span className={`text-xs font-sans font-normal ${theme === 'night' || theme === 'galaxy' ? 'text-[#C7D2DF]' : 'text-[#5A4D3F]'}`}>
            (Spend productivity coins on island cosmetics)
          </span>
        </h3>

        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter Bazaar items by category">
          {[{ id: 'all', label: 'All items' }, ...Array.from(new Set(shopItems.map((item) => item.category))).map((category) => ({
            id: category,
            label: ({ pet: 'Pets', house: 'House', decoration: 'Decorations', tree: 'Trees', farm: 'Farm', water: 'Water', theme: 'Themes' } as Record<string, string>)[category] ?? category,
          }))].map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={shopCategory === category.id}
              onClick={() => setShopCategory(category.id)}
              className={`px-3 py-1.5 text-xs font-bold border-2 transition-colors ${shopCategory === category.id
                ? 'bg-[#E5B23C] text-[#2B2118] border-[#875F0E]'
                : theme === 'night' || theme === 'galaxy'
                  ? 'bg-[#293847] text-[#E4EBF2] border-[#526579] hover:border-[#89A0B8]'
                  : 'bg-[#F8F4EA] text-[#5A4D3F] border-[#D5C7AF] hover:border-[#B5A586]'}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.filter((item) => shopCategory === 'all' || item.category === shopCategory).map((item) => {
            const levelLocked = islandLevel < (item.requiredLevel ?? 1);
            const canAfford = coins >= item.price;
            const canAffordOres = Object.entries(item.oreCost ?? {}).every(
              ([ore, amount]) => mining.oresMined[ore as keyof typeof mining.oresMined] >= (amount ?? 0)
            );
            const isOwned = item.owned;
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
                      {({ pet: 'PET', house: 'HOUSE', decoration: 'DECORATION', tree: 'TREE', farm: 'FARM', water: 'WATER', theme: 'THEME' } as Record<string, string>)[item.category] ?? item.category}
                    </span>
                    {isOwned && (
                      <span className="text-[11px] font-sans px-1.5 py-0.2 bg-[#EAF3E6] text-[#326122] border border-[#5FA244] rounded-xs font-bold tracking-wider">
                        {item.equipped ? 'EQUIPPED' : 'OWNED'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5A4D3F] mb-4 min-h-[32px]">
                    {item.description}
                  </p>
                  {item.ability && (
                    <p className="text-xs text-[#326122] font-semibold mb-4">
                      Ability: {item.ability}
                    </p>
                  )}
                  {item.farmIncome && (
                    <p className="text-xs text-[#326122] font-semibold mb-4">
                      Daily farm income: +{item.farmIncome} Coins
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D5C7AF]">
                  <div className="flex min-w-0 flex-col gap-1 font-sans text-xs font-bold text-[#875F0E]">
                    <div className="flex items-center gap-1">
                      <IconCoin size={14} />
                      <span>
                        {item.price === 0 ? 'FREE' : <><span className="font-number">{item.price}</span> Coins</>}
                      </span>
                    </div>
                    {item.oreCost && Object.keys(item.oreCost).length > 0 && (
                      <span className="text-[11px] leading-4 text-[#6B5A49]">
                        ⛏ Requires: {Object.entries(item.oreCost).map(([ore, amount]) =>
                          `${amount} ${ore === 'stone' ? 'Stone' : `${ore[0].toUpperCase()}${ore.slice(1)} Ore`}`
                        ).join(' · ')}
                      </span>
                    )}
                  </div>

                  {isOwned ? (
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
                      disabled={!canAfford || !canAffordOres || levelLocked}
                      onClick={() => buyShopItem(item.id)}
                      className="text-xs"
                    >
                      {levelLocked
                        ? `Unlocks at Level ${item.requiredLevel}`
                        : item.price === 0
                          ? 'Claim Trophy'
                          : 'Buy Item'}
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
