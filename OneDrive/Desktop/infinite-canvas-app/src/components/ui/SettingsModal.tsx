import React from 'react';
import { X, Sun, Moon, Zap, Download, Upload, Grid, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const activeTheme = useCanvasStore((state) => state.activeTheme);
  const setTheme = useCanvasStore((state) => state.setTheme);
  const snapToGrid = useCanvasStore((state) => state.snapToGrid);
  const setSnapToGrid = useCanvasStore((state) => state.setSnapToGrid);
  const exportJSON = useCanvasStore((state) => state.exportJSON);
  const importJSON = useCanvasStore((state) => state.importJSON);
  const resetCanvas = useCanvasStore((state) => state.resetCanvas);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Clear the entire workspace? This removes all cards, connections and drawings. You can undo it once.')) {
      resetCanvas();
      onClose();
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        importJSON(text);
        onClose();
      };
      reader.readAsText(file);
    }
  };

  const themeBtn = (theme: 'obsidian' | 'light' | 'amoled', icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTheme(theme)}
      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
        activeTheme === theme
          ? 'border-accent bg-accent-soft text-accent ring-1 ring-accent/30'
          : 'border-obsidian-border bg-obsidian-toolbar/40 text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md modal-shell rounded-2xl overflow-hidden text-obsidian-text p-5 flex flex-col gap-4 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
          <h3 className="font-bold text-base">Workspace Settings</h3>
          <button onClick={onClose} data-tip="Close" data-tip-place="top" className="text-obsidian-textMuted hover:text-obsidian-text transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-obsidian-textMuted uppercase tracking-wider">Visual Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {themeBtn('obsidian', <Moon size={16} />, 'Obsidian')}
            {themeBtn('light', <Sun size={16} />, 'Light')}
            {themeBtn('amoled', <Zap size={16} />, 'AMOLED')}
          </div>
        </div>

        {/* Canvas Options */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-obsidian-textMuted uppercase tracking-wider">Canvas Features</label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-obsidian-toolbar/40 border border-obsidian-border/50 cursor-pointer hover:bg-obsidian-input transition-colors">
            <div className="flex items-center gap-2">
              <Grid size={16} className="text-accent" />
              <span className="text-xs font-medium">Snap-to-Grid Alignment</span>
            </div>
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Export & Import */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-obsidian-textMuted uppercase tracking-wider">Data & Backup</label>
          <div className="flex gap-2">
            <button
              onClick={exportJSON}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-accent-soft border border-accent/30 text-accent text-xs font-semibold hover:bg-accent-soft/80 transition-colors"
            >
              <Download size={16} /> Export JSON
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-obsidian-toolbar border border-obsidian-border text-obsidian-text text-xs font-semibold cursor-pointer hover:bg-obsidian-input transition-colors">
              <Upload size={16} /> Import JSON
              <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-obsidian-textMuted uppercase tracking-wider">Danger Zone</label>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-obsidian-toolbar/40 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
          >
            <Trash2 size={16} /> Reset Workspace
          </button>
        </div>
      </div>
    </div>
  );
};