import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface HistoryIndicatorProps {
  showCounts?: boolean;
}

export const HistoryIndicator: React.FC<HistoryIndicatorProps> = ({ showCounts = false }) => {
  const undoStack = useCanvasStore((state) => state.undoStack);
  const redoStack = useCanvasStore((state) => state.redoStack);

  const undoCount = undoStack.length;
  const redoCount = redoStack.length;
  const canUndo = undoCount > 0;
  const canRedo = redoCount > 0;

  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-toolbar/80 border border-obsidian-border backdrop-blur text-[10px] text-obsidian-textMuted select-none pointer-events-none z-30"
    >
      <span className="flex items-center gap-1.5">
        <Undo2
          size={12}
          className={canUndo ? 'text-accent' : 'opacity-30'}
        />
        {showCounts ? (
          <span className={`font-mono ${canUndo ? 'text-accent' : 'opacity-40'}`}>{undoCount}</span>
        ) : (
          <span className={canUndo ? 'text-accent' : 'opacity-40'}>Undo</span>
        )}
      </span>

      <span className="w-px h-3 bg-obsidian-border/60" />

      <span className="flex items-center gap-1.5">
        <Redo2
          size={12}
          className={canRedo ? 'text-accent' : 'opacity-30'}
        />
        {showCounts ? (
          <span className={`font-mono ${canRedo ? 'text-accent' : 'opacity-40'}`}>{redoCount}</span>
        ) : (
          <span className={canRedo ? 'text-accent' : 'opacity-40'}>Redo</span>
        )}
      </span>
    </div>
  );
};

export default HistoryIndicator;