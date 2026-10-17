'use client';

import React, { useState } from 'react';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { LibraryNote } from '../../lib/types';
import { PixelPanel } from '../ui/PixelPanel';
import { PixelButton } from '../ui/PixelButton';
import {
  IconLibrary,
  IconPlus,
  IconTrash,
  IconSearch,
  IconSparkle,
} from '../icons/PixelIcons';

const renderInlineMarkdown = (text: string, keyPrefix: string) => {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key} className="font-bold">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={key}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={key} className="rounded bg-[#EAE0CA] px-1 py-0.5 font-mono text-[0.9em]">{token.slice(1, -1)}</code>;
    }
    return <React.Fragment key={key}>{token}</React.Fragment>;
  });
};

const renderMarkdown = (content: string) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    if (!line.trim()) continue;

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const HeadingTag = heading[1].length === 1 ? 'h1' : heading[1].length === 2 ? 'h2' : 'h3';
      const sizeClass = heading[1].length === 1 ? 'text-xl' : heading[1].length === 2 ? 'text-lg' : 'text-base';
      blocks.push(
        <HeadingTag key={`heading-${index}`} className={`font-pixel ${sizeClass} font-bold text-[#2B2118] mt-3 mb-2`}>
          {renderInlineMarkdown(heading[2], `heading-${index}`)}
        </HeadingTag>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        const itemLine = lines[index].replace(/^\s*[-*]\s+/, '');
        items.push(<li key={`list-item-${index}`}>{renderInlineMarkdown(itemLine, `list-item-${index}`)}</li>);
        index += 1;
      }
      index -= 1;
      blocks.push(<ul key={`list-${index}`} className="my-2 ml-5 list-disc space-y-1 text-[#2B2118]">{items}</ul>);
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={`quote-${index}`} className="my-3 border-l-4 border-[#B98E55] pl-3 italic text-[#6B5A49]">
          {renderInlineMarkdown(line.slice(2), `quote-${index}`)}
        </blockquote>
      );
      continue;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="my-2 whitespace-pre-wrap text-[#2B2118]">
        {renderInlineMarkdown(line, `paragraph-${index}`)}
      </p>
    );
  }

  return blocks;
};

export const LibraryView: React.FC = () => {
  const notes = useSkyDoStore((state) => state.notes);
  const addNote = useSkyDoStore((state) => state.addNote);
  const updateNote = useSkyDoStore((state) => state.updateNote);
  const deleteNote = useSkyDoStore((state) => state.deleteNote);
  const togglePinNote = useSkyDoStore((state) => state.togglePinNote);

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [isPreview, setIsPreview] = useState(true);

  // Active note object
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Distinct folders
  const folders = ['All', ...Array.from(new Set(notes.map((n) => n.folder).filter(Boolean)))];

  // Filtered notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'All' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleCreateNote = () => {
    addNote({
      title: 'Untitled Tome',
      content: '# New Entry\n\nRecord your thoughts, blueprints, or project reflections...',
      folder: selectedFolder === 'All' ? 'General' : selectedFolder,
      tags: ['draft'],
      pinned: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pixel-panel-parchment p-4 border-b-4 border-[#C8B896] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#2B2118] font-bold flex items-center gap-2">
            <IconLibrary size={24} />
            The Island Library
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D3F]">
            Leather-bound parchment notes and knowledge blueprints. Writing builds Foraging skill XP.
          </p>
        </div>

        <PixelButton
          variant="primary"
          size="md"
          onClick={handleCreateNote}
          className="flex items-center gap-1.5"
        >
          <IconPlus size={14} />
          <span>Inscribe New Book</span>
        </PixelButton>
      </div>

      {/* Main Grid: Left Bookshelf Sidebar, Right Markdown Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Bookshelf Shelf List */}
        <div className="lg:col-span-4 flex flex-col pixel-panel-wood p-3.5 border-2 border-[#6B4A2B] text-[#F4EFE6]">
          {/* Search bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#5C3D18] text-[#F4EFE6] border-t-2 border-l-2 border-[#3D260D] border-r-2 border-b-2 border-[#8B5A2B] px-3 py-1.5 text-xs rounded-xs outline-none focus:border-[#E3B341] placeholder-[#CFA46B]"
            />
          </div>

          {/* Folder Chips */}
          <div className="flex flex-wrap gap-1 mb-3 pb-2 border-b border-[#8B5A2B]/60">
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-2 py-0.5 text-[11px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                  selectedFolder === folder
                    ? 'bg-[#E3B341] text-[#2B2118] font-bold shadow-xs'
                    : 'bg-[#6B4A2B] text-[#E6DCBF] hover:bg-[#8B5A2B]'
                }`}
              >
                {folder}
              </button>
            ))}
          </div>

          {/* Books on Shelves List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-xs font-sans text-[#E6DCBF]/70">
                No tomes found on this shelf.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setIsPreview(true);
                    }}
                    className={`p-2.5 rounded-xs cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-[#FAF6ED] text-[#2B2118] border-l-[#E3B341] shadow-md'
                        : 'bg-[#8B5A2B]/80 text-[#F4EFE6] hover:bg-[#8B5A2B] border-l-[#5E3B1C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {note.pinned && <span className="text-[#E3B341]">📌</span>}
                        <h4 className="font-sans text-xs font-bold truncate">
                          {note.title}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs shrink-0 ${
                          isSelected ? 'bg-[#EAE0CA] text-[#6B5A49]' : 'bg-[#5E3B1C] text-[#CFA46B]'
                        }`}
                      >
                        {note.folder || 'Notes'}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate ${
                        isSelected ? 'text-[#6B5A49]' : 'text-[#D5C7AF]'
                      }`}
                    >
                      {note.content.replace(/^#+\s+/g, '').slice(0, 50)}...
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Clean Parchment Editor */}
        <div className="lg:col-span-8 flex flex-col pixel-panel-parchment p-5 border-2 border-[#D5C7AF]">
          {activeNote ? (
            <>
              {/* Note Header Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#D5C7AF]">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="font-pixel text-lg sm:text-xl font-bold text-[#2B2118] bg-transparent border-b border-transparent hover:border-[#CDBE9F] focus:border-[#E3B341] outline-none w-full"
                    placeholder="Tome Title..."
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePinNote(activeNote.id)}
                    className={`px-2.5 py-1 text-xs font-sans font-semibold border rounded-xs ${
                      activeNote.pinned
                        ? 'bg-[#E3B341] border-[#99701A] text-[#2B2118] font-bold'
                        : 'bg-[#FAF6ED] border-[#CDBE9F] text-[#6B5A49] hover:bg-[#F3EAD7]'
                    }`}
                  >
                    {activeNote.pinned ? '📌 Pinned' : 'Pin'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className="px-2.5 py-1 text-xs font-sans font-semibold bg-[#EAE0CA] border border-[#CDBE9F] text-[#2B2118] hover:bg-[#FAF6ED] rounded-xs"
                  >
                    {isPreview ? '✎ Edit' : '👁 Preview'}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1.5 text-[#8A8D91] hover:text-[#B3392F] hover:bg-[#F9ECEB] rounded-xs"
                    title="Delete Note"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Folder & Tags Bar */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="text-[#6B5A49] font-sans font-semibold">Folder:</span>
                <input
                  type="text"
                  value={activeNote.folder}
                  onChange={(e) => updateNote(activeNote.id, { folder: e.target.value })}
                  placeholder="e.g. Guides, Projects"
                  className="pixel-input text-xs py-0.5 px-2 bg-white max-w-[140px]"
                />
              </div>

              {/* Editor / Markdown Render Area */}
              <div className="flex-1 flex flex-col">
                {isPreview ? (
                  <div className="flex-1 p-4 bg-white/60 border border-[#D5C7AF] rounded-xs overflow-y-auto text-sm font-sans leading-relaxed">
                    {renderMarkdown(activeNote.content)}
                  </div>
                ) : (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Write markdown notes..."
                    className="w-full flex-1 p-3 text-sm font-sans text-[#2B2118] bg-white border border-[#D5C7AF] rounded-xs outline-none focus:border-[#E3B341] resize-none leading-relaxed min-h-[360px]"
                  />
                )}
              </div>

              {/* Footer word count & time */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#D5C7AF] text-[11px] font-sans text-[#6B5A49]">
                <span>
                  Words: {activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0} • Characters: {activeNote.content.length}
                </span>
                <span>
                  Last saved: {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <IconLibrary size={48} className="text-[#8A8D91] mb-3 opacity-60" />
              <h3 className="font-pixel text-base text-[#2B2118] mb-1">
                No Book Selected
              </h3>
              <p className="text-xs text-[#5A4D3F] mb-4">
                Choose a tome from the bookshelf or inscribe a new one.
              </p>
              <PixelButton variant="primary" size="md" onClick={handleCreateNote}>
                + Inscribe New Book
              </PixelButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
