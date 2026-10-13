'use client';

import React, { useState, useEffect } from 'react';
import { Minion, MinionCategory, MinionIcon } from '../../lib/types';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { IconMinion } from '../icons/PixelIcons';

export interface MinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  minionToEdit?: Minion | null;
}

export const MinionModal: React.FC<MinionModalProps> = ({
  isOpen,
  onClose,
  minionToEdit,
}) => {
  const addMinion = useSkyDoStore((state) => state.addMinion);
  const editMinion = useSkyDoStore((state) => state.editMinion);

  const [name, setName] = useState('');
  const [habit, setHabit] = useState('');
  const [category, setCategory] = useState<MinionCategory>('farming');
  const [resourceName, setResourceName] = useState('Wheat');
  const [iconType, setIconType] = useState<MinionIcon>('wheat');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (minionToEdit) {
      setName(minionToEdit.name);
      setHabit(minionToEdit.habit);
      setCategory(minionToEdit.category);
      setResourceName(minionToEdit.resourceName);
      setIconType(minionToEdit.iconType);
      setFrequency(minionToEdit.frequency);
    } else {
      setName('');
      setHabit('');
      setCategory('farming');
      setResourceName('Golden Crop');
      setIconType('wheat');
      setFrequency('daily');
    }
  }, [minionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !habit.trim()) return;

    if (minionToEdit) {
      editMinion(minionToEdit.id, {
        name: name.trim(),
        habit: habit.trim(),
        category,
        resourceName: resourceName.trim() || 'Resource',
        iconType,
        frequency,
      });
    } else {
      addMinion({
        name: name.trim(),
        habit: habit.trim(),
        category,
        resourceName: resourceName.trim() || 'Resource',
        iconType,
        frequency,
      });
    }

    onClose();
  };

  const categories: MinionCategory[] = ['farming', 'mining', 'combat', 'foraging', 'fishing'];

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={minionToEdit ? 'Configure Minion Habit' : 'Deploy New Minion'}
      icon={<IconMinion size={18} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Minion Designation *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Iron Minion, Hydration Sentinel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pixel-input text-sm text-[#2B2118]"
          />
        </div>

        {/* Recurring Habit */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Recurring Habit / Routine *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 20 minutes of morning cardio"
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            className="w-full pixel-input text-sm text-[#2B2118]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Skill Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#E3B341] text-[#2B2118] border-2 border-[#99701A] shadow-xs'
                    : 'bg-[#FAF6ED] text-[#6B5A49] border border-[#CDBE9F] hover:bg-[#F3EAD7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Name */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Harvest Resource Drop Name
          </label>
          <input
            type="text"
            placeholder="e.g. Golden Ingot, Oak Plank, Mind Crystal"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            className="w-full pixel-input text-sm text-[#2B2118]"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Cadence
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold">
              <input
                type="radio"
                name="freq"
                checked={frequency === 'daily'}
                onChange={() => setFrequency('daily')}
                className="accent-[#5FA244]"
              />
              <span>Daily Routine</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold">
              <input
                type="radio"
                name="freq"
                checked={frequency === 'weekly'}
                onChange={() => setFrequency('weekly')}
                className="accent-[#5FA244]"
              />
              <span>Weekly Milestone</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#D5C7AF]">
          <PixelButton type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton type="submit" variant="primary" size="md">
            {minionToEdit ? 'Save Minion' : 'Deploy Minion'}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};
