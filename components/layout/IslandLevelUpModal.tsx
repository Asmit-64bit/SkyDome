'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { PixelButton } from '../ui/PixelButton';
import { IconIsland, IconSparkle } from '../icons/PixelIcons';

export const IslandLevelUpModal: React.FC = () => {
  const levelUpModal = useSkyDoStore((state) => state.levelUpModal);
  const setLevelUpModal = useSkyDoStore((state) => state.setLevelUpModal);
  const setActiveTab = useSkyDoStore((state) => state.setActiveTab);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  useEffect(() => {
    if (levelUpModal && !reducedMotion) {
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#5FA244', '#E3B341', '#4AA3B5', '#FAF6ED', '#8B5A2B'],
          shapes: ['square'],
          scalar: 1,
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [levelUpModal, reducedMotion]);

  if (!levelUpModal) return null;

  const handleDismiss = () => {
    setLevelUpModal(null);
  };

  const handleGoToIsland = () => {
    setLevelUpModal(null);
    setActiveTab('island');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="pixel-panel-parchment max-w-md w-full p-6 sm:p-7 border-4 border-[#C8B896] shadow-2xl relative text-center"
        >
          {/* Header Badge */}
          <div className="w-16 h-16 mx-auto mb-3 bg-[#5FA244] border-2 border-[#7EC461] rounded-xs flex items-center justify-center shadow-md animate-bounce">
            <IconIsland size={36} />
          </div>

          <div className="inline-block px-3 py-1 bg-[#E3B341] text-[#2B2118] font-sans text-xs font-bold uppercase tracking-wider rounded-xs mb-2 border border-[#99701A] shadow-xs">
            SANCTUARY EXPANSION
          </div>

          <h2 className="font-pixel text-2xl sm:text-3xl font-bold text-[#2B2118] mb-1">
            ISLAND LEVEL {levelUpModal.level}!
          </h2>

          <p className="text-xs sm:text-sm text-[#5A4D3F] mb-5">
            Your daily consistency has grown the bedrock of your floating sanctuary.
          </p>

          {/* Perks Unlocked Card */}
          <div className="bg-[#FAF6ED] p-4 border-2 border-[#D5C7AF] rounded-xs text-left mb-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-[#2B2118] mb-1">
              <IconSparkle size={14} />
              <span>NEW UPGRADES UNLOCKED:</span>
            </div>
            {levelUpModal.unlockedPerks.map((perk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs sm:text-sm font-sans font-medium text-[#326122] bg-[#EAF3E6] p-2 border border-[#B8DCAB] rounded-xs"
              >
                <span>✨</span>
                <span>{perk}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton
              variant="primary"
              size="md"
              onClick={handleGoToIsland}
              className="w-full sm:w-auto min-w-[140px]"
            >
              🏝️ View Island
            </PixelButton>
            <PixelButton
              variant="wood"
              size="md"
              onClick={handleDismiss}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Continue
            </PixelButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
