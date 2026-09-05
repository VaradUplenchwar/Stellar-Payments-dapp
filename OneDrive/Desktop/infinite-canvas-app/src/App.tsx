import { useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from './store/useCanvasStore';
import { CanvasViewport } from './components/canvas/CanvasViewport';
import { MainToolbar } from './components/ui/MainToolbar';
import { ZoomWidget } from './components/ui/ZoomWidget';
import { Minimap } from './components/ui/Minimap';
import { CommandPalette } from './components/ui/CommandPalette';
import { SearchModal } from './components/ui/SearchModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { AboutModal } from './components/ui/AboutModal';
import { ContextMenu } from './components/ui/ContextMenu';
import { HistoryIndicator } from './components/ui/HistoryIndicator';
import { SelectionToolbar } from './components/ui/SelectionToolbar';
import { useAutoSave } from './hooks/useAutoSave';

export function App() {
  const activeTheme = useCanvasStore((state) => state.activeTheme);
  const deleteSelected = useCanvasStore((state) => state.deleteSelected);
  const duplicateSelected = useCanvasStore((state) => state.duplicateSelected);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const fitToContent = useCanvasStore((state) => state.fitToContent);
  const addElement = useCanvasStore((state) => state.addElement);
  const viewport = useCanvasStore((state) => state.viewport);
  const cancelDraftConnection = useCanvasStore((state) => state.cancelDraftConnection);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // First-run onboarding: show the guide automatically when no saved canvas exists yet
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !localStorage.getItem('second-brain-canvas-autosave');
    } catch {
      return false;
    }
  });

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string | null;
  } | null>(null);

  // Activate auto-save (restores from localStorage on mount)
  useAutoSave();

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest('[data-element-id]');
    if (target) {
      const id = target.getAttribute('data-element-id');
      const state = useCanvasStore.getState();
      if (id && !state.selectedIds.includes(id)) {
        state.selectElement(id);
      }
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetId: target ? target.getAttribute('data-element-id') : null,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [handleContextMenu]);

  // Paste image from clipboard as a new image card
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);

      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const pos = {
          x: (window.innerWidth / 2 - viewport.panX) / viewport.zoom - 130,
          y: (window.innerHeight / 2 - viewport.panY) / viewport.zoom - 90,
        };
        addElement('image' as any, pos.x, pos.y, {
          width: 300,
          height: 240,
          imageUrl: src,
          title: 'Pasted Image',
        });
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addElement, viewport.panX, viewport.panY, viewport.zoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen((v) => !v);
      } else if (ctrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (ctrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (ctrl && e.key === '0') {
        e.preventDefault();
        fitToContent();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key.toLowerCase() === 'n') {
        const pos = {
          x: (window.innerWidth / 2 - viewport.panX) / viewport.zoom - 130,
          y: (window.innerHeight / 2 - viewport.panY) / viewport.zoom - 80,
        };
        addElement('note', pos.x, pos.y);
      } else if (e.key.toLowerCase() === 'c') {
        const pos = {
          x: (window.innerWidth / 2 - viewport.panX) / viewport.zoom - 120,
          y: (window.innerHeight / 2 - viewport.panY) / viewport.zoom - 100,
        };
        addElement('checklist' as any, pos.x, pos.y, {
          width: 240,
          height: 200,
          title: 'Task List',
          items: [
            { id: 'i1', text: 'First task', done: false },
            { id: 'i2', text: 'Second task', done: false },
          ],
        });
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
      } else if (e.key.toLowerCase() === 'p') {
        setActiveTool('pen');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser');
      } else if (e.key === '?') {
        setIsHelpOpen(true);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
        setIsHelpOpen(false);
        setShowIntro(false);
        setContextMenu(null);
        cancelDraftConnection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, duplicateSelected, undo, redo, setActiveTool, fitToContent, addElement, viewport.panX, viewport.panY, viewport.zoom, cancelDraftConnection]);

  const themeClass =
    activeTheme === 'light' ? 'theme-light' : activeTheme === 'amoled' ? 'theme-amoled' : '';

  return (
    <div className={`w-screen h-screen relative bg-obsidian-bg ${themeClass}`}>
      <CanvasViewport />
      {/* Brand chip */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-toolbar/80 border border-obsidian-border backdrop-blur z-30 select-none pointer-events-none"
        style={{ boxShadow: 'var(--shadow-pop)' }}>
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-[11px] font-semibold text-obsidian-text tracking-wide">
          Second Brain
        </span>
        <span className="text-[9px] text-obsidian-textMuted/70 font-mono">v1.0</span>
      </div>
      <MainToolbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      <ZoomWidget />
      <Minimap />
      <SelectionToolbar />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AboutModal
        isOpen={isHelpOpen || showIntro}
        onClose={() => { setIsHelpOpen(false); setShowIntro(false); }}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetId={contextMenu.targetId}
          onClose={() => setContextMenu(null)}
        />
      )}

      <HistoryIndicator showCounts />

      {/* Auto-save indicator */}
      <div className="fixed bottom-2 left-3 text-[10px] text-obsidian-textMuted/40 select-none pointer-events-none">
        Auto-saved
      </div>
    </div>
  );
}

export default App;

