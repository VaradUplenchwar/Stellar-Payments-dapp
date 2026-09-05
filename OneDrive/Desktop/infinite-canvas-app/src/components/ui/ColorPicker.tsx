import React, { useState, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Palette } from 'lucide-react';

const COLORS = [
  { name: 'default', label: 'Default', dot: '#4a4a58' },
  { name: 'red', label: 'Red', dot: '#ef4444' },
  { name: 'orange', label: 'Orange', dot: '#f97316' },
  { name: 'yellow', label: 'Yellow', dot: '#eab308' },
  { name: 'green', label: 'Green', dot: '#22c55e' },
  { name: 'blue', label: 'Blue', dot: '#3b82f6' },
  { name: 'purple', label: 'Purple', dot: '#a855f7' },
];

const CONN_COLORS = [
  '#888888', '#3b82f6', '#22c55e', '#ef4444', '#f97316', '#eab308', '#a855f7', '#ec4899',
];

interface ColorPickerProps {
  elementId?: string;
  connectionId?: string;
  onClose: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ elementId, connectionId, onClose }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const updateConnection = useCanvasStore((state) => state.updateConnection);
  const ref = useRef<HTMLDivElement>(null);

  if (elementId) {
    return (
      <div
        ref={ref}
        className="flex items-center gap-1 bg-obsidian-toolbar border border-obsidian-border rounded-xl p-1.5"
        style={{ boxShadow: 'var(--shadow-pop)' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {COLORS.map((c) => (
          <button
            key={c.name}
            data-tip={c.label}
            data-tip-place="top"
            onClick={() => { updateElement(elementId, { color: c.name }); onClose(); }}
            className="w-5 h-5 rounded-full border-2 border-obsidian-border/60 hover:scale-125 hover:ring-2 hover:ring-accent/30 transition-all"
            style={{ backgroundColor: c.dot }}
          />
        ))}
      </div>
    );
  }

  if (connectionId) {
    return (
      <div
        ref={ref}
        className="flex items-center gap-1 bg-obsidian-toolbar border border-obsidian-border rounded-xl p-1.5"
        style={{ boxShadow: 'var(--shadow-pop)' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {CONN_COLORS.map((c) => (
          <button
            key={c}
            data-tip={c}
            data-tip-place="top"
            onClick={() => { updateConnection(connectionId, { color: c }); onClose(); }}
            className="w-5 h-5 rounded-full border-2 border-obsidian-border/60 hover:scale-125 hover:ring-2 hover:ring-accent/30 transition-all"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Standalone palette button for ElementWrapper header
export const PaletteButton: React.FC<{ elementId: string }> = ({ elementId }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        data-tip="Change color"
        data-tip-place="top"
        className="text-obsidian-textMuted hover:text-obsidian-text transition-colors p-0.5 rounded"
      >
        <Palette size={12} />
      </button>
      {open && (
        <div className="absolute top-6 right-0 z-50">
          <ColorPicker elementId={elementId} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};
