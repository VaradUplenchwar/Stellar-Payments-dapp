import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { RefreshCw } from 'lucide-react';
import type { CanvasElement, ShapeKind } from '../../types/canvas';

const CYCLE: ShapeKind[] = ['rectangle', 'diamond', 'circle', 'arrow'];

const SHAPE_COLORS: Record<ShapeKind, string> = {
  rectangle: '#22c55e',
  diamond: '#a855f7',
  circle: '#3b82f6',
  arrow: '#f97316',
};

export const ShapeElement: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [title, setTitle] = useState(element.title || 'Shape');

  const shape = element.shapeKind || 'rectangle';
  const color = SHAPE_COLORS[shape] || '#22c55e';

  useEffect(() => {
    if (element.title !== undefined) setTitle(element.title);
  }, [element.title]);

  const cycleShape = () => {
    const idx = CYCLE.indexOf(shape);
    updateElement(element.id, { shapeKind: CYCLE[(idx + 1) % CYCLE.length] });
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {shape === 'circle' && (
          <ellipse
            cx="50%"
            cy="50%"
            rx="45%"
            ry="45%"
            fill={`${color}26`}
            stroke={color}
            strokeWidth="2"
          />
        )}
        {shape === 'diamond' && (
          <polygon
            points="50%,5 95%,50% 50%,95% 5%,50%"
            fill={`${color}26`}
            stroke={color}
            strokeWidth="2"
          />
        )}
        {shape === 'rectangle' && (
          <rect
            x="5%"
            y="5%"
            width="90%"
            height="90%"
            rx="8"
            fill={`${color}26`}
            stroke={color}
            strokeWidth="2"
          />
        )}
        {shape === 'arrow' && (
          <g>
            <defs>
              <marker id={`arrow-shape-${element.id}`} markerWidth="12" markerHeight="8" refX="8" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" fill={color} />
              </marker>
            </defs>
            <line
              x1="12%"
              y1="50%"
              x2="82%"
              y2="50%"
              stroke={color}
              strokeWidth="3"
              markerEnd={`url(#arrow-shape-${element.id})`}
            />
          </g>
        )}
      </svg>

      <button
        onClick={(e) => { e.stopPropagation(); cycleShape(); }}
        onPointerDown={(e) => e.stopPropagation()}
        title={`Cycle shape type (${shape})`}
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-obsidian-surface border border-obsidian-border text-obsidian-textMuted opacity-0 group-hover:opacity-100 hover:text-obsidian-text transition-opacity z-10"
      >
        <RefreshCw size={11} />
      </button>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => updateElement(element.id, { title })}
        onPointerDown={(e) => e.stopPropagation()}
        className="z-10 bg-transparent text-center font-bold text-sm outline-none text-obsidian-text max-w-[80%]"
      />
    </div>
  );
};