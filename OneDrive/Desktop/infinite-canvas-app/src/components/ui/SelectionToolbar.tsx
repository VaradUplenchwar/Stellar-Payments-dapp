import React from 'react';
import { Copy, BringToFront, SendToBack, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

const DOTS = [
  { name: 'default', color: '#4a4a58' },
  { name: 'red', color: '#ef4444' },
  { name: 'orange', color: '#f97316' },
  { name: 'yellow', color: '#eab308' },
  { name: 'green', color: '#22c55e' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'purple', color: '#a855f7' },
];

export const SelectionToolbar: React.FC = () => {
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const elements = useCanvasStore((state) => state.elements);
  const viewport = useCanvasStore((state) => state.viewport);
  const duplicateSelected = useCanvasStore((state) => state.duplicateSelected);
  const deleteSelected = useCanvasStore((state) => state.deleteSelected);
  const bringToFront = useCanvasStore((state) => state.bringToFront);
  const sendToBack = useCanvasStore((state) => state.sendToBack);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const selected = selectedIds.filter((id) => elements.some((el) => el.id === id));
  if (selected.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  selected.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const sx = el.x * viewport.zoom + viewport.panX;
    const sy = el.y * viewport.zoom + viewport.panY;
    const sw = el.width * viewport.zoom;
    const sh = el.height * viewport.zoom;
    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx + sw);
    maxY = Math.max(maxY, sy + sh);
  });

  if (!Number.isFinite(minX)) return null;

  const w = selected.length > 1 ? 320 : 280;
  const left = Math.max(8, Math.min(minX + (maxX - minX) / 2 - w / 2, window.innerWidth - w - 8));
  const above = minY - 12 - 40;
  const top = above > 64 ? above : maxY + 12 + 8;

  const colorToAll = (color: string) => {
    selected.forEach((id) => updateElement(id, { color }));
  };

  return (
    <div
      className="fixed z-40 flex items-center gap-1 px-2 py-1.5 bg-obsidian-toolbar/95 backdrop-blur-xl border border-obsidian-border rounded-full select-none animate-fade-in"
      style={{ left, top, boxShadow: 'var(--shadow-pop)' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="px-1.5 text-[10px] font-semibold text-accent whitespace-nowrap">
        {selected.length} item{selected.length > 1 ? 's' : ''}
      </span>

      <div className="w-px h-4 bg-obsidian-border/60 mx-0.5" />

      <button
        onClick={duplicateSelected}
        data-tip="Duplicate (Ctrl+D)"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-obsidian-input text-obsidian-textMuted hover:text-obsidian-text hover:ring-1 hover:ring-accent/20 transition-all"
      >
        <Copy size={13} />
      </button>
      <button
        onClick={() => selected.forEach((id) => bringToFront(id))}
        data-tip="Bring to Front"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-obsidian-input text-obsidian-textMuted hover:text-obsidian-text hover:ring-1 hover:ring-accent/20 transition-all"
        disabled={selected.length === 0}
      >
        <BringToFront size={13} />
      </button>
      <button
        onClick={() => selected.forEach((id) => sendToBack(id))}
        data-tip="Send to Back"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-obsidian-input text-obsidian-textMuted hover:text-obsidian-text hover:ring-1 hover:ring-accent/20 transition-all"
      >
        <SendToBack size={13} />
      </button>

      <div className="w-px h-4 bg-obsidian-border/60 mx-0.5" />

      {DOTS.map((d) => (
        <button
          key={d.name}
          data-tip={`Color: ${d.name}`}
          data-tip-place="top"
          onClick={() => colorToAll(d.name)}
          className="w-4 h-4 rounded-full border border-obsidian-border/60 hover:scale-125 hover:ring-2 hover:ring-accent/30 transition-all"
          style={{ backgroundColor: d.color }}
        />
      ))}

      <div className="w-px h-4 bg-obsidian-border/60 mx-0.5" />

      <button
        onClick={deleteSelected}
        data-tip="Delete (Del)"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-500/20 text-obsidian-textMuted hover:text-red-400 hover:ring-1 hover:ring-red-500/30 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};