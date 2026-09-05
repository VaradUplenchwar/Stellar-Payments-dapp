import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const ZoomWidget: React.FC = () => {
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const fitToContent = useCanvasStore((state) => state.fitToContent);

  const zoomIn = () => {
    const newZoom = Math.min(viewport.zoom * 1.2, 3.0);
    setViewport({ zoom: newZoom });
  };

  const zoomOut = () => {
    const newZoom = Math.max(viewport.zoom / 1.2, 0.15);
    setViewport({ zoom: newZoom });
  };

  return (
    <div className="fixed bottom-4 right-56 flex items-center gap-0.5 px-2 py-1.5 bg-obsidian-toolbar/90 backdrop-blur-xl border border-obsidian-border rounded-full z-40 select-none text-xs text-obsidian-text"
        style={{ boxShadow: 'var(--shadow-pop)' }}>
      <button
        onClick={zoomOut}
        data-tip="Zoom Out (-)"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-obsidian-input text-obsidian-textMuted hover:text-obsidian-text transition-colors"
      >
        <ZoomOut size={15} />
      </button>
      <span className="w-12 text-center font-mono font-semibold tabular-nums">
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button
        onClick={zoomIn}
        data-tip="Zoom In (+)"
        data-tip-place="top"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-obsidian-input text-obsidian-textMuted hover:text-obsidian-text transition-colors"
      >
        <ZoomIn size={15} />
      </button>
      <div className="w-[1px] h-4 bg-obsidian-border mx-1" />
      <button
        onClick={fitToContent}
        data-tip="Fit All Content (Ctrl+0)"
        data-tip-place="top"
        className="flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-accent text-white hover:opacity-90 transition-opacity font-medium text-[11px]"
      >
        <Maximize size={12} />
        Fit
      </button>
    </div>
  );
};
