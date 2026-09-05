import React, { useRef, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const DrawingCanvas: React.FC = () => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const viewport = useCanvasStore((state) => state.viewport);
  const penColor = useCanvasStore((state) => state.penColor);
  const penSize = useCanvasStore((state) => state.penSize);
  const drawings = useCanvasStore((state) => state.drawings);
  const addDrawingPath = useCanvasStore((state) => state.addDrawingPath);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isPenActive = activeTool === 'pen' || activeTool === 'eraser';

  // Full re-render of all paths when zoom/pan/drawings change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.panX, viewport.panY);

    drawings.forEach((path) => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = path.eraser ? 'destination-out' : 'source-over';
      if (path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [drawings, viewport]);

  const screenToCanvas = (sx: number, sy: number) => ({
    x: (sx - viewport.panX) / viewport.zoom,
    y: (sy - viewport.panY) / viewport.zoom,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPenActive) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = screenToCanvas(e.clientX, e.clientY);
    pointsRef.current = [pos];
    lastPointRef.current = pos;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const pos = screenToCanvas(e.clientX, e.clientY);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && lastPointRef.current) {
      ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.panX, viewport.panY);
      ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = activeTool === 'eraser' ? '#000' : penColor;
      ctx.lineWidth = activeTool === 'eraser' ? penSize * 4 : penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    pointsRef.current.push(pos);
    lastPointRef.current = pos;
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = pointsRef.current;
    if (points.length > 1) {
      addDrawingPath({
        id: 'draw_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        points,
        color: penColor,
        size: activeTool === 'eraser' ? penSize * 4 : penSize,
        eraser: activeTool === 'eraser',
      });
    }
    pointsRef.current = [];
    lastPointRef.current = null;
  };

  if (!isPenActive && drawings.length === 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${
        isPenActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      }`}
      style={{ zIndex: 1 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};