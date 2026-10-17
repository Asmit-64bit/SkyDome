'use client';

import React, { useState } from 'react';
import { Quest, QuestPriority } from '../../lib/types';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { PixelBadge } from '../ui/PixelBadge';
import { IconQuest, IconPlus, IconTrash } from '../icons/PixelIcons';

export interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  questToEdit?: Quest | null;
}

const QuestModalForm: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  questToEdit,
}) => {
  const addQuest = useSkyDoStore((state) => state.addQuest);
  const editQuest = useSkyDoStore((state) => state.editQuest);

  const [title, setTitle] = useState(questToEdit?.title ?? '');
  const [description, setDescription] = useState(questToEdit?.description ?? '');
  const [priority, setPriority] = useState<QuestPriority>(questToEdit?.priority ?? 'common');
  const [dueDate, setDueDate] = useState(questToEdit?.dueDate ?? '');
  const [dueTime, setDueTime] = useState(questToEdit?.dueTime ?? '');
  const [tagsInput, setTagsInput] = useState(questToEdit?.tags.join(', ') ?? '');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(questToEdit?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st_${Date.now()}`, title: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (questToEdit) {
      editQuest(questToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        tags: parsedTags,
        subtasks,
      });
    } else {
      addQuest({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        tags: parsedTags,
        subtasks,
        xpReward: 20,
        coinReward: 12,
      });
    }

    onClose();
  };

  const priorities: QuestPriority[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={questToEdit ? 'Edit Quest' : 'Plant New Quest'}
      icon={<IconQuest size={18} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Quest Objective *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Complete sprint retrospective"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pixel-input text-sm text-[#2B2118]"
          />
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1.5">
            Rarity / Priority
          </label>
          <div className="flex flex-wrap gap-1.5">
            {priorities.map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 text-xs font-sans font-bold uppercase tracking-wider border rounded-xs transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#E3B341] shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <PixelBadge priority={p} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full pixel-input text-xs text-[#2B2118]"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
              Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full pixel-input text-xs text-[#2B2118]"
            />
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Notes & Details
          </label>
          <textarea
            rows={2}
            placeholder="Additional context or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pixel-input text-sm text-[#2B2118] resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="work, health, focus, island"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full pixel-input text-xs text-[#2B2118]"
          />
        </div>

        {/* Subtasks Checklist */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#5A4D3F] mb-1">
            Subtask Checklist ({subtasks.length})
          </label>
          <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto pr-1">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 p-1.5 bg-[#FAF6ED] border border-[#D5C7AF] rounded-xs text-xs"
              >
                <span className="truncate text-[#2B2118]">{st.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-[#8A8D91] hover:text-[#B3392F]"
                >
                  <IconTrash size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add step..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="pixel-input text-xs flex-1 h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newSubtask.trim()) {
                    setSubtasks([
                      ...subtasks,
                      { id: `st_${Date.now()}`, title: newSubtask.trim(), completed: false },
                    ]);
                    setNewSubtask('');
                  }
                }
              }}
            />
            <PixelButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              className="h-8"
            >
              <IconPlus size={12} />
            </PixelButton>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#D5C7AF]">
          <PixelButton type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton type="submit" variant="primary" size="md">
            {questToEdit ? 'Save Changes' : 'Plant Quest'}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};

export const QuestModal: React.FC<QuestModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <QuestModalForm key={props.questToEdit?.id ?? 'new-quest'} {...props} />;
};
