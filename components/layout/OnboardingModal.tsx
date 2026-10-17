'use client';

import React, { useState } from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { IslandTheme } from '../../lib/types';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { IconIsland, IconSparkle, IconQuest } from '../icons/PixelIcons';

export const OnboardingModal: React.FC = () => {
  const onboardingCompleted = useSkyDoStore((state) => state.onboardingCompleted);
  const setOnboardingCompleted = useSkyDoStore((state) => state.setOnboardingCompleted);
  const islandName = useSkyDoStore((state) => state.islandName);
  const setIslandName = useSkyDoStore((state) => state.setIslandName);
  const theme = useSkyDoStore((state) => state.theme);
  const setTheme = useSkyDoStore((state) => state.setTheme);
  const addQuest = useSkyDoStore((state) => state.addQuest);

  const [step, setStep] = useState(1);
  const [firstQuestTitle, setFirstQuestTitle] = useState('Explore the SkyDo sanctuary features');

  if (onboardingCompleted) return null;

  const handleFinish = () => {
    if (firstQuestTitle.trim()) {
      addQuest({
        title: firstQuestTitle.trim(),
        priority: 'rare',
        tags: ['starter', 'island'],
        subtasks: [
          { id: 'st_init_1', title: 'Check off a habit minion', completed: false },
          { id: 'st_init_2', title: 'Complete a 25m focus mining session', completed: false },
        ],
        xpReward: 35,
        coinReward: 20,
      });
    }
    setOnboardingCompleted(true);
  };

  return (
    <PixelModal
      isOpen={!onboardingCompleted}
      onClose={() => setOnboardingCompleted(true)}
      title={`Skyblock Welcome — Step ${step} of 3`}
      icon={<IconIsland size={20} />}
    >
      <div className="space-y-4 py-1">
        {step === 1 && (
          <div className="space-y-3">
            <div className="text-center py-2">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center bg-[#FAF6ED] border-2 border-[#C8B896] rounded-xs shadow-xs">
                <IconIsland size={36} />
              </div>
              <h3 className="font-pixel text-lg font-bold text-[#2B2118]">
                Name Your Skyblock Island
              </h3>
              <p className="text-xs text-[#5A4D3F] mt-1">
                Your island floats high in the sky. Level up to unlock new Bazaar offers, then spend coins to purchase and place trees, cabins, and waterfalls.
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
                Island Sanctuary Name
              </label>
              <input
                type="text"
                value={islandName}
                onChange={(e) => setIslandName(e.target.value)}
                placeholder="e.g. Aether Peak, SkyDome Haven"
                className="w-full pixel-input text-sm text-[#2B2118]"
              />
            </div>

            <div className="flex justify-end pt-3">
              <PixelButton variant="primary" size="md" onClick={() => setStep(2)}>
                Next: Atmosphere →
              </PixelButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="text-center py-2">
              <h3 className="font-pixel text-lg font-bold text-[#2B2118]">
                Select Starter Sky Atmosphere
              </h3>
              <p className="text-xs text-[#5A4D3F] mt-1">
                Choose the ambient daytime horizon for your sanctuary. All themes are naturally muted and non-glare.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {([
                { id: 'day', label: 'Daytime Azure', bg: '#8EC9F0' },
                { id: 'sunset', label: 'Amber Sunset', bg: '#D87B40' },
                { id: 'cloudy', label: 'Overcast Slate', bg: '#8E9CA8' },
                { id: 'night', label: 'Midnight Sky', bg: '#1B2939' },
              ] satisfies { id: IslandTheme; label: string; bg: string }[]).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`p-3 text-left border-2 rounded-xs transition-all cursor-pointer ${
                    theme === th.id
                      ? 'bg-white border-[#E3B341] ring-2 ring-[#E3B341]'
                      : 'bg-[#FAF6ED] border-[#D5C7AF] hover:bg-[#F3EAD7]'
                  }`}
                >
                  <div
                    className="w-full h-8 mb-2 rounded-xs border border-black/10"
                    style={{ backgroundColor: th.bg }}
                  />
                  <div className="font-sans text-xs font-bold text-[#2B2118]">
                    {th.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-3">
              <PixelButton variant="ghost" size="md" onClick={() => setStep(1)}>
                ← Back
              </PixelButton>
              <PixelButton variant="primary" size="md" onClick={() => setStep(3)}>
                Next: First Quest →
              </PixelButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-[#FAF6ED] border border-[#C8B896] rounded-xs">
                <IconQuest size={28} />
              </div>
              <h3 className="font-pixel text-lg font-bold text-[#2B2118]">
                Plant Your First Quest
              </h3>
              <p className="text-xs text-[#5A4D3F] mt-1">
                Every great journey begins with a single block placed. What is your first priority?
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
                Quest Title
              </label>
              <input
                type="text"
                value={firstQuestTitle}
                onChange={(e) => setFirstQuestTitle(e.target.value)}
                placeholder="e.g. Finish client presentation"
                className="w-full pixel-input text-sm text-[#2B2118]"
              />
            </div>

            <div className="flex justify-between pt-3">
              <PixelButton variant="ghost" size="md" onClick={() => setStep(2)}>
                ← Back
              </PixelButton>
              <PixelButton variant="primary" size="md" onClick={handleFinish}>
                Begin Adventure ⚔️
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    </PixelModal>
  );
};
