import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  StickyNote as StickyIcon, 
  Code, 
  Image as ImageIcon, 
  Square, 
  Search, 
  Maximize, 
  Trash2, 
  Download, 
  Sun, 
  Moon, 
  Zap 
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const addElement = useCanvasStore((state) => state.addElement);
  const viewport = useCanvasStore((state) => state.viewport);
  const fitToContent = useCanvasStore((state) => state.fitToContent);
  const deleteSelected = useCanvasStore((state) => state.deleteSelected);
  const exportJSON = useCanvasStore((state) => state.exportJSON);
  const setTheme = useCanvasStore((state) => state.setTheme);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const screenCenterToCanvas = () => ({
    x: (window.innerWidth / 2 - viewport.panX) / viewport.zoom,
    y: (window.innerHeight / 2 - viewport.panY) / viewport.zoom,
  });

  const commands = [
    {
      label: 'Add Markdown Note',
      category: 'Create',
      icon: <FileText size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('note', pos.x - 120, pos.y - 80);
      },
    },
    {
      id: 'add-sticky',
      label: 'Add Sticky Note',
      category: 'Create',
      icon: <StickyIcon size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('sticky', pos.x - 100, pos.y - 100);
      },
    },
    {
      id: 'add-code',
      label: 'Add Code Snippet',
      category: 'Create',
      icon: <Code size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('code', pos.x - 160, pos.y - 90);
      },
    },
    {
      id: 'add-image',
      label: 'Add Image Card',
      category: 'Create',
      icon: <ImageIcon size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('image', pos.x - 150, pos.y - 120);
      },
    },
    {
      id: 'add-shape',
      label: 'Add Geometric Shape',
      category: 'Create',
      icon: <Square size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('shape', pos.x - 80, pos.y - 60);
      },
    },
    {
      id: 'add-math',
      label: 'Add Math LaTeX Equation',
      category: 'Create',
      icon: <FileText size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('math' as any, pos.x - 100, pos.y - 60, { width: 200, height: 120, title: 'Equation' });
      },
    },
    {
      id: 'add-mindmap',
      label: 'Add Mind Map Node',
      category: 'Create',
      icon: <Square size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('mindmap' as any, pos.x - 100, pos.y - 40, { width: 200, height: 80, content: 'Central Idea', title: 'Mind Map' });
      },
    },
    {
      id: 'add-checklist',
      label: 'Add Checklist / Task List',
      category: 'Create',
      icon: <FileText size={16} />,
      action: () => {
        const pos = screenCenterToCanvas();
        addElement('checklist' as any, pos.x - 120, pos.y - 100, {
          width: 240, height: 200, title: 'Task List',
          items: [
            { id: 'i1', text: 'First task', done: false },
            { id: 'i2', text: 'Second task', done: false },
          ],
        });
      },
    },
    {
      id: 'fit-content',
      label: 'Fit All Content into Viewport',
      category: 'View',
      icon: <Maximize size={16} />,
      action: () => fitToContent(),
    },
    {
      id: 'theme-obsidian',
      label: 'Switch Theme: Obsidian Dark',
      category: 'Theme',
      icon: <Moon size={16} />,
      action: () => setTheme('obsidian'),
    },
    {
      id: 'theme-light',
      label: 'Switch Theme: Light',
      category: 'Theme',
      icon: <Sun size={16} />,
      action: () => setTheme('light'),
    },
    {
      id: 'theme-amoled',
      label: 'Switch Theme: AMOLED Black',
      category: 'Theme',
      icon: <Zap size={16} />,
      action: () => setTheme('amoled'),
    },
    {
      id: 'export-json',
      label: 'Export Canvas Project JSON',
      category: 'File',
      icon: <Download size={16} />,
      action: () => exportJSON(),
    },
    {
      id: 'export-png',
      label: 'Export Canvas to High-Res PNG',
      category: 'File',
      icon: <ImageIcon size={16} />,
      action: async () => {
        const { exportCanvasToPNG } = await import('../../utils/exportUtils');
        const viewport = document.getElementById('canvas-viewport');
        if (viewport) exportCanvasToPNG(viewport);
      },
    },
    {
      id: 'export-svg',
      label: 'Export Canvas to SVG Vector',
      category: 'File',
      icon: <ImageIcon size={16} />,
      action: async () => {
        const { exportCanvasToSVG } = await import('../../utils/exportUtils');
        const viewport = document.getElementById('canvas-viewport');
        if (viewport) exportCanvasToSVG(viewport);
      },
    },
    {
      id: 'export-markdown',
      label: 'Export Notes to Markdown',
      category: 'File',
      icon: <FileText size={16} />,
      action: async () => {
        const { exportCanvasToMarkdown } = await import('../../utils/exportUtils');
        exportCanvasToMarkdown(useCanvasStore.getState().elements);
      },
    },
    {
      id: 'delete-selected',
      label: 'Delete Selected Elements',
      category: 'Edit',
      icon: <Trash2 size={16} />,
      action: () => deleteSelected(),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
    );

  const commit = (cmd: (typeof commands)[number]) => {
    cmd.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit(filteredCommands[Math.min(selectedIndex, filteredCommands.length - 1)]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl modal-shell rounded-2xl overflow-hidden text-obsidian-text animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-obsidian-border bg-obsidian-toolbar/50">
          <Search size={18} className="text-accent" />
          <input
            type="text"
            placeholder="Type a command or search... (Ctrl+Shift+P)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-sm placeholder-obsidian-textMuted"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-obsidian-input border border-obsidian-border rounded text-obsidian-textMuted">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredCommands.map((cmd, idx) => (
            <button
              key={cmd.id}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => commit(cmd)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group ${
                idx === selectedIndex ? 'bg-obsidian-input ring-1 ring-accent/30' : 'hover:bg-obsidian-input'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${idx === selectedIndex ? 'text-accent' : 'text-obsidian-textMuted group-hover:text-accent'}`}>
                  {cmd.icon}
                </span>
                <span className="text-xs font-medium">{cmd.label}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-obsidian-toolbar text-obsidian-textMuted">
                {cmd.category}
              </span>
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="p-4 text-center text-xs text-obsidian-textMuted">
              No matching commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};