import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, FileText, StickyNote, Code, Square, Image as ImageIcon, ListChecks, Hash, GitFork } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

const TYPE_ICON: Record<string, React.ReactNode> = {
  note: <FileText size={12} />,
  sticky: <StickyNote size={12} />,
  code: <Code size={12} />,
  shape: <Square size={12} />,
  image: <ImageIcon size={12} />,
  checklist: <ListChecks size={12} />,
  math: <Hash size={12} />,
  mindmap: <GitFork size={12} />,
};

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const elements = useCanvasStore((state) => state.elements);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const selectElement = useCanvasStore((state) => state.selectElement);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const results = elements.filter((el) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      (el.title || '').toLowerCase().includes(q) ||
      (el.content || '').toLowerCase().includes(q) ||
      (el.language || '').toLowerCase().includes(q)
    );
  });

  const jumpToElement = (el: any) => {
    const targetX = window.innerWidth / 2 - (el.x + el.width / 2);
    const targetY = window.innerHeight / 2 - (el.y + el.height / 2);
    setViewport({ panX: targetX, panY: targetY, zoom: 1 });
    selectElement(el.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg modal-shell rounded-2xl overflow-hidden text-obsidian-text p-4 flex flex-col gap-3 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-obsidian-border pb-2">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-accent" />
            <h3 className="font-bold text-sm">Search Workspace Notes</h3>
          </div>
          <button onClick={onClose} data-tip="Close" data-tip-place="top" className="text-obsidian-textMuted hover:text-obsidian-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search node content or titles... (Ctrl+F)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-obsidian-input px-3 py-2 rounded-xl border border-obsidian-border outline-none text-xs text-obsidian-text focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 mt-1">
          {results.map((el) => (
            <div
              key={el.id}
              onClick={() => jumpToElement(el)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-toolbar/40 border border-obsidian-border/50 hover:bg-obsidian-input cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-obsidian-toolbar border border-obsidian-border text-obsidian-textMuted group-hover:text-accent transition-colors">
                  {TYPE_ICON[el.type as string] ?? <FileText size={12} />}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-accent truncate">{el.title || el.type.toUpperCase()}</span>
                  <span className="text-[11px] text-obsidian-textMuted line-clamp-1">
                    {el.content || 'Empty node'}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="shrink-0 text-obsidian-textMuted group-hover:text-accent transition-colors" />
            </div>
          ))}
          {query.trim() && results.length === 0 && (
            <div className="p-4 text-center text-xs text-obsidian-textMuted">No notes found matching "{query}"</div>
          )}
          {!query.trim() && results.length === 0 && (
            <div className="p-4 text-center text-xs text-obsidian-textMuted">Start typing to search your notes</div>
          )}
        </div>
      </div>
    </div>
  );
};