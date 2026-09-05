import React, { useState, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { GridBackground } from './GridBackground';
import { DrawingCanvas } from './DrawingCanvas';
import { MarqueeSelector } from './MarqueeSelector';
import { ConnectionLayer } from '../connections/ConnectionLayer';
import { ElementWrapper } from '../elements/ElementWrapper';

export const CanvasViewport: React.FC = () => {
  const elements = useCanvasStore((state) => state.elements);
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const addElement = useCanvasStore((state) => state.addElement);
  const draftConnection = useCanvasStore((state) => state.draftConnection);
  const cancelDraftConnection = useCanvasStore((state) => state.cancelDraftConnection);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isMarquee, setIsMarquee] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);
  const [initialSelection, setInitialSelection] = useState<string[]>([]);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const screenToCanvas = (sx: number, sy: number) => ({
    x: (sx - viewport.panX) / viewport.zoom,
    y: (sy - viewport.panY) / viewport.zoom,
  });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const ZOOM_SENSITIVITY = 0.0015;
    const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
    const oldZoom = viewport.zoom;
    const newZoom = Math.min(Math.max(oldZoom * (1 + zoomDelta), 0.15), 3.0);

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const panX = mouseX - (mouseX - viewport.panX) * (newZoom / oldZoom);
    const panY = mouseY - (mouseY - viewport.panY) * (newZoom / oldZoom);

    setViewport({ panX, panY, zoom: newZoom });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== viewportRef.current && (e.target as HTMLElement).id !== 'grid-canvas') {
      return;
    }

    // Clicking empty canvas cancels any in-progress connection draft
    if (draftConnection) {
      cancelDraftConnection();
    }

    const isMiddle = e.button === 1;
    const isPanMode = activeTool === 'pan' || isMiddle;

    if (isPanMode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
    } else if (activeTool === 'select') {
      if (!e.shiftKey) {
        clearSelection();
        setInitialSelection([]);
      } else {
        setInitialSelection(useCanvasStore.getState().selectedIds);
      }
      setIsMarquee(true);
      setMarqueeStart({ x: e.clientX, y: e.clientY });
      setMarqueeCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
    } else if (isMarquee && marqueeStart) {
      setMarqueeCurrent({ x: e.clientX, y: e.clientY });

      // Calculate canvas bounding box for selection
      const left = Math.min(marqueeStart.x, e.clientX);
      const top = Math.min(marqueeStart.y, e.clientY);
      const right = Math.max(marqueeStart.x, e.clientX);
      const bottom = Math.max(marqueeStart.y, e.clientY);

      const selectedIds: string[] = [];
      elements.forEach((el) => {
        const screenX = el.x * viewport.zoom + viewport.panX;
        const screenY = el.y * viewport.zoom + viewport.panY;
        const screenW = el.width * viewport.zoom;
        const screenH = el.height * viewport.zoom;

        if (
          screenX + screenW >= left &&
          screenX <= right &&
          screenY + screenH >= top &&
          screenY <= bottom
        ) {
          selectedIds.push(el.id);
        }
      });
      
      if (e.shiftKey) {
        selectMultiple([...new Set([...initialSelection, ...selectedIds])]);
      } else {
        selectMultiple(selectedIds);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsMarquee(false);
    setMarqueeStart(null);
    setMarqueeCurrent(null);
    setInitialSelection([]);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === viewportRef.current || (e.target as HTMLElement).id === 'grid-canvas') {
      if (draftConnection) cancelDraftConnection();
      const pos = screenToCanvas(e.clientX, e.clientY);
      addElement('note', pos.x - 130, pos.y - 80);
    }
  };

  return (
    <div
      id="canvas-viewport"
      ref={viewportRef}
      className={`relative w-screen h-screen overflow-hidden select-none ${
        draftConnection
          ? 'cursor-crosshair'
          : isPanning
            ? 'cursor-grabbing'
            : activeTool === 'pan'
              ? 'cursor-grab'
              : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <GridBackground />

      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-fade-in text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-obsidian-surface border border-obsidian-border flex items-center justify-center text-obsidian-textMuted shadow-xl">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-obsidian-textMuted">
                Your canvas is empty
              </p>
              <p className="text-xs text-obsidian-textMuted/60 mt-1">
                Double-click anywhere to add a note, or use
                <span className="inline-flex items-center gap-1.5 mx-1 align-middle">
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-obsidian-surface border border-obsidian-border text-obsidian-textMuted shadow">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-obsidian-surface border border-obsidian-border text-obsidian-textMuted shadow">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </span>
                to add anything
              </p>
            </div>
          </div>
        </div>
      )}
      <DrawingCanvas />
      <ConnectionLayer />
      <MarqueeSelector
        isSelecting={isMarquee}
        startPos={marqueeStart}
        currentPos={marqueeCurrent}
      />

      {/* Dynamic Element Workspace Container */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {elements.map((el) => (
          <div key={el.id} className="pointer-events-auto">
            <ElementWrapper element={el} />
          </div>
        ))}
      </div>
    </div>
  );
};
