import React, { useRef, useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';
import { PaletteButton } from '../ui/ColorPicker';
import { NoteCard } from './NoteCard';
import { StickyNote } from './StickyNote';
import { CodeCard } from './CodeCard';
import { ImageCard } from './ImageCard';
import { ShapeElement } from './ShapeElement';
import { MathNode } from './MathNode';
import { MindMapNode } from './MindMapNode';
import { ChecklistCard } from './ChecklistCard';

const COLOR_DOT: Record<string, string> = {
  default: '#9a9aa6',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
};

interface ElementWrapperProps {
  element: CanvasElement;
}

const renderElementContent = (el: CanvasElement) => {
  switch (el.type) {
    case 'note': return <NoteCard element={el} />;
    case 'sticky': return <StickyNote element={el} />;
    case 'code': return <CodeCard element={el} />;
    case 'image': return <ImageCard element={el} />;
    case 'shape': return <ShapeElement element={el} />;
    case 'math': return <MathNode element={el} />;
    case 'mindmap': return <MindMapNode element={el} />;
    case 'checklist': return <ChecklistCard element={el} />;
    default: return <NoteCard element={el} />;
  }
};

export const ElementWrapper: React.FC<ElementWrapperProps> = React.memo(({ element }) => {
  const isSelected = useCanvasStore((s) => s.selectedIds.includes(element.id));
  const activeTool = useCanvasStore((state) => state.activeTool);
  const startDraftConnection = useCanvasStore((state) => state.startDraftConnection);
  const createConnection = useCanvasStore((state) => state.createConnection);
  const draftConnection = useCanvasStore((state) => state.draftConnection);
  const cancelDraftConnection = useCanvasStore((state) => state.cancelDraftConnection);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const pushHistory = useCanvasStore((state) => state.pushHistory);

  const draggedIds = useRef<string[]>([]);
  const draggedOrigins = useRef<Record<string, { x: number; y: number }>>({});
  const movedRef = useRef(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const isDraftTarget = draftConnection !== null && draftConnection.fromId !== element.id;

  const commitTitle = () => {
    const value = titleDraft.trim();
    if (value && value !== element.title) {
      pushHistory();
      updateElement(element.id, { title: value });
    }
    setEditingTitle(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'select' && activeTool !== 'pan') return;
    e.stopPropagation();
    useCanvasStore.getState().bringToFront(element.id);
    useCanvasStore.getState().selectElement(element.id, e.shiftKey);

    // Don't start a drag when interacting with inputs, buttons, ports or the title editor
    const target = e.target as HTMLElement;
    const interactive = target.closest('input, textarea, select, button, [data-port], [data-resize], [data-title-edit]');
    if (interactive || activeTool === 'pan') return;

    const zoom = useCanvasStore.getState().viewport.zoom;

    // Dragging a card body cancels any in-progress connection draft
    if (draftConnection) cancelDraftConnection();

    // Group drag: when the clicked card is part of a multi-selection, move them all
    const group = isSelected && useCanvasStore.getState().selectedIds.length > 1
      ? useCanvasStore.getState().selectedIds
      : [element.id];
    const origins: Record<string, { x: number; y: number }> = {};
    useCanvasStore.getState().elements.forEach((el) => {
      if (group.includes(el.id)) origins[el.id] = { x: el.x, y: el.y };
    });
    draggedIds.current = Object.keys(origins);
    draggedOrigins.current = origins;
    movedRef.current = false;

    const snapToGrid = useCanvasStore.getState().snapToGrid;
    const gridSize = useCanvasStore.getState().gridSize;

    const handleMouseMove = (me: MouseEvent) => {
      const dx = (me.clientX - e.clientX) / zoom;
      const dy = (me.clientY - e.clientY) / zoom;

      if (!movedRef.current) {
        movedRef.current = true;
        pushHistory();
      }

      refreshDragged((_id, orig) => {
        let newX = orig.x + dx;
        let newY = orig.y + dy;

        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        return { x: newX, y: newY };
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      draggedIds.current = [];
      draggedOrigins.current = {};
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const refreshDragged = (apply: (id: string, orig: { x: number; y: number }) => { x: number; y: number }) => {
    const elMap = new Map(useCanvasStore.getState().elements.map((el) => [el.id, el]));
    draggedIds.current.forEach((id) => {
      const orig = draggedOrigins.current[id];
      const el = elMap.get(id);
      if (!orig || !el) return;
      const pos = apply(id, orig);
      if (pos.x !== el.x || pos.y !== el.y) {
        updateElement(id, pos);
      }
    });
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y, width: w, height: h } = element;
    const zoom = useCanvasStore.getState().viewport.zoom;

    const snapToGrid = useCanvasStore.getState().snapToGrid;
    const gridSize = useCanvasStore.getState().gridSize;
    let resizeMoved = false;

    const handleMouseMove = (me: MouseEvent) => {
      if (!resizeMoved) {
        resizeMoved = true;
        pushHistory();
      }
      const dx = (me.clientX - startX) / zoom;
      const dy = (me.clientY - startY) / zoom;

      let newW = w;
      let newH = h;
      let newX = x;
      let newY = y;

      if (handle.includes('e')) newW = Math.max(160, w + dx);
      if (handle.includes('s')) newH = Math.max(100, h + dy);
      if (handle.includes('w')) {
        const possibleW = Math.max(160, w - dx);
        if (possibleW > 160) {
          newW = possibleW;
          newX = x + dx;
        }
      }
      if (handle.includes('n')) {
        const possibleH = Math.max(100, h - dy);
        if (possibleH > 100) {
          newH = possibleH;
          newY = y + dy;
        }
      }

      if (snapToGrid) {
        if (handle.includes('e') || handle.includes('w')) {
          newW = Math.max(gridSize, Math.round(newW / gridSize) * gridSize);
        }
        if (handle.includes('s') || handle.includes('n')) {
          newH = Math.max(gridSize, Math.round(newH / gridSize) * gridSize);
        }
        if (handle.includes('w')) {
          newX = Math.round(newX / gridSize) * gridSize;
        }
        if (handle.includes('n')) {
          newY = Math.round(newY / gridSize) * gridSize;
        }
      }

      updateElement(element.id, { x: newX, y: newY, width: newW, height: newH });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePortClick = (e: React.MouseEvent, side: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    if (activeTool === 'pan') return;
    if (draftConnection) {
      createConnection(element.id, side);
    } else {
      startDraftConnection(element.id, side);
    }
  };

  return (
    <div
      className={`canvas-element animate-element-in absolute group rounded-xl border bg-obsidian-surface text-obsidian-text ${
        isSelected ? 'selected ring-accent' : 'border-obsidian-border hover:border-obsidian-textMuted'
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
      }}
      data-color={element.color || 'default'}
      data-element-id={element.id}
      onMouseDown={handleMouseDown}
    >
      {/* Header drag bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-obsidian-border/50 cursor-move bg-obsidian-toolbar/40 rounded-t-xl select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1" data-title-edit>
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-obsidian-border/60"
            style={{ backgroundColor: COLOR_DOT[element.color || 'default'] }}
          />
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') commitTitle();
                else if (e.key === 'Escape') setEditingTitle(false);
              }}
              className="flex-1 min-w-0 text-xs font-semibold bg-obsidian-input border border-accent/40 rounded px-1.5 py-0.5 outline-none text-obsidian-text"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setTitleDraft(element.title || '');
                setEditingTitle(true);
              }}
              data-tip="Double-click to rename"
              data-tip-place="top"
              className="text-xs font-semibold text-obsidian-textMuted group-hover:text-obsidian-text transition-colors truncate max-w-[120px]"
            >
              {element.title || element.type.toUpperCase()}
            </span>
          )}
        </div>
        {!editingTitle && <PaletteButton elementId={element.id} />}
      </div>

      {/* Body content */}
      <div className="p-3 h-[calc(100%-32px)] overflow-auto">{renderElementContent(element)}</div>

      {/* Connection Ports */}
      <div
        data-port="top"
        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent border-2 border-obsidian-surface rounded-full z-20 transition-all cursor-crosshair hover:scale-125 ${
          draftConnection ? 'port-highlight' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={(e) => handlePortClick(e, 'top')}
        title={isDraftTarget ? 'Connect here' : 'Connect from Top'}
      />
      <div
        data-port="bottom"
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent border-2 border-obsidian-surface rounded-full z-20 transition-all cursor-crosshair hover:scale-125 ${
          draftConnection ? 'port-highlight' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={(e) => handlePortClick(e, 'bottom')}
        title={isDraftTarget ? 'Connect here' : 'Connect from Bottom'}
      />
      <div
        data-port="left"
        className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent border-2 border-obsidian-surface rounded-full z-20 transition-all cursor-crosshair hover:scale-125 ${
          draftConnection ? 'port-highlight' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={(e) => handlePortClick(e, 'left')}
        title={isDraftTarget ? 'Connect here' : 'Connect from Left'}
      />
      <div
        data-port="right"
        className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent border-2 border-obsidian-surface rounded-full z-20 transition-all cursor-crosshair hover:scale-125 ${
          draftConnection ? 'port-highlight' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={(e) => handlePortClick(e, 'right')}
        title={isDraftTarget ? 'Connect here' : 'Connect from Right'}
      />

      {/* Resize Handles */}
      {isSelected && (
        <>
          <div
            data-resize="se"
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-accent border-2 border-obsidian-surface rounded-full cursor-nwse-resize z-30 shadow"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            data-resize="sw"
            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-accent border-2 border-obsidian-surface rounded-full cursor-nesw-resize z-30 shadow"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            data-resize="ne"
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent border-2 border-obsidian-surface rounded-full cursor-nesw-resize z-30 shadow"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            data-resize="nw"
            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-accent border-2 border-obsidian-surface rounded-full cursor-nwse-resize z-30 shadow"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
        </>
      )}
    </div>
  );
});

ElementWrapper.displayName = 'ElementWrapper';