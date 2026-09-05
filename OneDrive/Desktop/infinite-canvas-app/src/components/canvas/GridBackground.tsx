import React, { useCallback, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

/**
 * Plain canvas background. Paints a solid color derived from the active
 * theme's --bg-main so the workspace is clean and distraction-free.
 */
export const GridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTheme = useCanvasStore((state) => state.activeTheme);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bg = getComputedStyle(canvas).getPropertyValue('--bg-main').trim() || '#141416';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Very subtle radial tone for depth (keeps the canvas effectively plain)
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.9;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    if (activeTheme === 'light') {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.032)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.008)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, [activeTheme]);

  useEffect(() => {
    paint();
  }, [activeTheme, paint]);

  useEffect(() => {
    const handleResize = () => paint();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [paint]);

  return <canvas ref={canvasRef} id="grid-canvas" />;
};