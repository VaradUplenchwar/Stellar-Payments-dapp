import React, { useRef, useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodeCount, setNodeCount] = useState(0);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = useCanvasStore.getState();
      const { elements, connections, viewport, activeTheme } = state;

      canvas.width = 180;
      canvas.height = 120;

      const bgColor = activeTheme === 'light' ? '#f4f4f6' : activeTheme === 'amoled' ? '#0a0a0c' : '#141416';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const accent = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#60a5fa';

      if (elements.length !== nodeCount) {
        setNodeCount(elements.length);
      }

      if (elements.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });

      const padding = 100;
      minX -= padding; minY -= padding;
      maxX += padding; maxY += padding;

      const boundsW = Math.max(400, maxX - minX);
      const boundsH = Math.max(300, maxY - minY);

      const scaleX = canvas.width / boundsW;
      const scaleY = canvas.height / boundsH;
      const scale = Math.min(scaleX, scaleY);

      const getPort = (elId: string, side: string) => {
        const el = elements.find((item) => item.id === elId);
        if (!el) return null;
        switch (side) {
          case 'top': return { x: el.x + el.width / 2, y: el.y };
          case 'bottom': return { x: el.x + el.width / 2, y: el.y + el.height };
          case 'left': return { x: el.x, y: el.y + el.height / 2 };
          case 'right': return { x: el.x + el.width, y: el.y + el.height / 2 };
          default: return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
        }
      };

      connections.forEach((conn) => {
        const from = getPort(conn.fromId, conn.fromSide);
        const to = getPort(conn.toId, conn.toSide);
        if (!from || !to) return;
        ctx.strokeStyle = conn.color || '#888';
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo((from.x - minX) * scale, (from.y - minY) * scale);
        ctx.lineTo((to.x - minX) * scale, (to.y - minY) * scale);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      elements.forEach((el) => {
        const mx = (el.x - minX) * scale;
        const my = (el.y - minY) * scale;
        const mw = el.width * scale;
        const mh = el.height * scale;

        ctx.fillStyle = accent;
        ctx.fillRect(mx, my, Math.max(2, mw), Math.max(2, mh));
      });

      const vpLeft = (-viewport.panX / viewport.zoom - minX) * scale;
      const vpTop = (-viewport.panY / viewport.zoom - minY) * scale;
      const vpW = (window.innerWidth / viewport.zoom) * scale;
      const vpH = (window.innerHeight / viewport.zoom) * scale;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vpLeft, vpTop, vpW, vpH);
    };

    draw();

    // Imperatively redraw on any store change (rAF-batched — no React re-render)
    let raf = 0;
    const unsubscribe = useCanvasStore.subscribe((state, prev) => {
      if (
        state.elements === prev.elements &&
        state.connections === prev.connections &&
        state.viewport === prev.viewport &&
        state.activeTheme === prev.activeTheme
      ) {
        return;
      }
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
    });

    window.addEventListener('resize', draw);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', draw);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [nodeCount]);

  return (
    <div className="fixed bottom-4 right-4 w-[196px] bg-obsidian-toolbar/90 backdrop-blur border border-obsidian-border rounded-xl z-40 select-none overflow-hidden"
        style={{ boxShadow: 'var(--shadow-pop)' }}>
      <div className="flex items-center justify-between px-2.5 pt-1.5 pb-1">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-obsidian-textMuted/70">
          Minimap
        </span>
        <span className="text-[9px] font-mono text-obsidian-textMuted/60">
          {nodeCount} nodes
        </span>
      </div>
      <canvas ref={canvasRef} className="w-[180px] h-[120px] rounded-lg mx-1" />
    </div>
  );
};