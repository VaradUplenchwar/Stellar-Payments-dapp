import React from 'react';
import { 
  MousePointer, 
  Hand, 
  FileText, 
  StickyNote as StickyIcon, 
  Code, 
  Image as ImageIcon, 
  Square, 
  PenTool, 
  Eraser, 
  Undo, 
  Redo, 
  Search, 
  Settings, 
  HelpCircle, 
  Download, 
  ListChecks, 
  Sigma, 
  Network
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ToolMode } from '../../types/canvas';

export const MainToolbar: React.FC<{
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}> = ({ onOpenSearch, onOpenSettings, onOpenHelp }) => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const addElement = useCanvasStore((state) => state.addElement);
  const viewport = useCanvasStore((state) => state.viewport);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const undoStack = useCanvasStore((state) => state.undoStack);
  const redoStack = useCanvasStore((state) => state.redoStack);
  const exportJSON = useCanvasStore((state) => state.exportJSON);

  const screenCenterToCanvas = () => ({
    x: (window.innerWidth / 2 - viewport.panX) / viewport.zoom,
    y: (window.innerHeight / 2 - viewport.panY) / viewport.zoom,
  });

  const handleAddAtCenter = (type: any, payload?: any) => {
    const pos = screenCenterToCanvas();
    addElement(type, pos.x - 120, pos.y - 80, payload);
    setActiveTool('select');
  };

  const tools: { mode: ToolMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'select', label: 'Select (V)', icon: <MousePointer size={18} /> },
    { mode: 'pan', label: 'Pan Hand (H)', icon: <Hand size={18} /> },
    { mode: 'pen', label: 'Draw Pen (P)', icon: <PenTool size={18} /> },
    { mode: 'eraser', label: 'Eraser (E)', icon: <Eraser size={18} /> },
  ];

  const activeTone: Record<ToolMode, string> = {
    select: 'bg-accent text-white shadow-md shadow-accent/30',
    pan: 'bg-accent text-white shadow-md shadow-accent/30',
    pen: 'bg-accent text-white shadow-md shadow-accent/30',
    eraser: 'bg-accent text-white shadow-md shadow-accent/30',
    note: '',
    sticky: '',
    code: '',
    image: '',
    checklist: '',
    math: '',
    shape: '',
    connect: '',
  };

  const addButtons = [
    { type: 'note', label: 'Add Note (N)', icon: <FileText size={18} />, tone: 'hover:text-blue-400' },
    { type: 'sticky', label: 'Add Sticky Note', icon: <StickyIcon size={18} />, tone: 'hover:text-amber-400' },
    { type: 'code', label: 'Add Code Snippet', icon: <Code size={18} />, tone: 'hover:text-purple-400' },
    { type: 'checklist', label: 'Add Checklist', icon: <ListChecks size={18} />, tone: 'hover:text-emerald-400' },
    { type: 'math', label: 'Add LaTeX Equation', icon: <Sigma size={18} />, tone: 'hover:text-cyan-400' },
    { type: 'mindmap', label: 'Add Mind Map Node', icon: <Network size={18} />, tone: 'hover:text-orange-400' },
    { type: 'image', label: 'Add Image Node', icon: <ImageIcon size={18} />, tone: 'hover:text-teal-400' },
    { type: 'shape', label: 'Add Geometric Shape', icon: <Square size={18} />, tone: 'hover:text-rose-400' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 p-2 bg-obsidian-toolbar/85 backdrop-blur-xl border border-obsidian-border rounded-2xl z-40 select-none"
      style={{ boxShadow: 'var(--shadow-pop)' }}>
      <div className="flex flex-col gap-1">
        {tools.map((t) => (
          <button
            key={t.mode}
            onClick={() => setActiveTool(t.mode)}
            data-tip={t.label}
            data-tip-place="right"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              activeTool === t.mode
                ? activeTone[t.mode]
                : 'text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text hover:ring-1 hover:ring-accent/20'
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-6 h-[1px] bg-obsidian-border/70 mx-auto my-1" />

      <div className="flex flex-col gap-1">
        {addButtons.map((b) => (
          <button
            key={b.type}
            onClick={() => handleAddAtCenter(b.type, b.type === 'checklist' ? {
              width: 240, height: 200, title: 'Task List',
              items: [
                { id: 'i1', text: 'First task', done: false },
                { id: 'i2', text: 'Second task', done: false },
              ],
            } : b.type === 'math' ? { width: 200, height: 120, title: 'Equation' } : b.type === 'mindmap' ? { width: 200, height: 80, content: 'Central Idea', title: 'Mind Map' } : undefined)}
            data-tip={b.label}
            data-tip-place="right"
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-obsidian-textMuted hover:bg-obsidian-input transition-all ${b.tone} hover:ring-1 hover:ring-accent/20`}
          >
            {b.icon}
          </button>
        ))}
      </div>

      <div className="w-6 h-[1px] bg-obsidian-border/70 mx-auto my-1" />

      <div className="flex flex-col gap-1">
        <button
          onClick={onOpenSearch}
          data-tip="Search Notes (Ctrl+F)"
          data-tip-place="right"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text transition-all hover:ring-1 hover:ring-accent/20"
        >
          <Search size={18} />
        </button>
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          data-tip="Undo (Ctrl+Z)"
          data-tip-place="right"
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
            undoStack.length === 0
              ? 'text-obsidian-textMuted/30 cursor-not-allowed'
              : 'text-obsidian-textMuted hover:bg-obsidian-input hover:text-accent'
          }`}
        >
          <Undo size={18} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          data-tip="Redo (Ctrl+Y)"
          data-tip-place="right"
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
            redoStack.length === 0
              ? 'text-obsidian-textMuted/30 cursor-not-allowed'
              : 'text-obsidian-textMuted hover:bg-obsidian-input hover:text-accent'
          }`}
        >
          <Redo size={18} />
        </button>
        <button
          onClick={exportJSON}
          data-tip="Export Project JSON"
          data-tip-place="right"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text transition-all hover:ring-1 hover:ring-accent/20"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="w-6 h-[1px] bg-obsidian-border/70 mx-auto my-1" />

      <div className="flex flex-col gap-1">
        <button
          onClick={onOpenSettings}
          data-tip="Settings & Themes"
          data-tip-place="right"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text transition-all hover:ring-1 hover:ring-accent/20"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={onOpenHelp}
          data-tip="How to use & shortcuts (?)"
          data-tip-place="right"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-obsidian-textMuted hover:bg-obsidian-input hover:text-obsidian-text transition-all hover:ring-1 hover:ring-accent/20"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};
