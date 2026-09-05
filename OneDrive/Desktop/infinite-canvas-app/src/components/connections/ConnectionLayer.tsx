import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Palette, Trash2 } from 'lucide-react';
import { ColorPicker } from '../ui/ColorPicker';
import type { Connection } from '../../types/canvas';

const computePath = (
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  fromSide: string,
  toSide: string,
  lineType: 'bezier' | 'straight' | 'step' = 'bezier'
) => {
  if (lineType === 'straight') {
    return `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
  }

  if (lineType === 'step') {
    const midX = (fromPos.x + toPos.x) / 2;
    return `M ${fromPos.x} ${fromPos.y} H ${midX} V ${toPos.y} H ${toPos.x}`;
  }

  const offset = 60;
  const getCP = (pos: { x: number; y: number }, side: string) => {
    switch (side) {
      case 'right': return { x: pos.x + offset, y: pos.y };
      case 'left': return { x: pos.x - offset, y: pos.y };
      case 'top': return { x: pos.x, y: pos.y - offset };
      case 'bottom': return { x: pos.x, y: pos.y + offset };
      default: return { x: pos.x, y: pos.y };
    }
  };

  const cp1 = getCP(fromPos, fromSide);
  const cp2 = getCP(toPos, toSide);
  return `M ${fromPos.x} ${fromPos.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${toPos.x} ${toPos.y}`;
};

interface ConnectionLineProps {
  conn: Connection;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = React.memo(({ conn, fx, fy, tx, ty }) => {
  const isSelected = useCanvasStore((s) => s.selectedIds.includes(conn.id));
  const selectElement = useCanvasStore((state) => state.selectElement);
  const updateConnection = useCanvasStore((state) => state.updateConnection);
  const deleteConnection = useCanvasStore((state) => state.deleteConnection);
  const pushHistory = useCanvasStore((state) => state.pushHistory);

  const [editing, setEditing] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const fromPos = { x: fx, y: fy };
  const toPos = { x: tx, y: ty };
  const d = computePath(fromPos, toPos, conn.fromSide, conn.toSide, conn.lineType || 'bezier');
  const midX = (fx + tx) / 2;
  const midY = (fy + ty) / 2;

  const commitLabel = (value: string) => {
    pushHistory();
    updateConnection(conn.id, { label: value.trim() || undefined });
    setEditing(false);
  };

  const cycleLineType = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    const types: ('bezier' | 'straight' | 'step')[] = ['bezier', 'straight', 'step'];
    const nextIndex = (types.indexOf(conn.lineType || 'bezier') + 1) % types.length;
    updateConnection(conn.id, { lineType: types[nextIndex] });
  };

  return (
    <g
      className="pointer-events-auto cursor-pointer"
      onClick={() => selectElement(conn.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
        selectElement(conn.id);
      }}
    >
      <path
        d={d}
        stroke={isSelected ? 'var(--accent)' : (conn.color || '#666')}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={conn.lineStyle === 'dashed' ? '6,6' : (conn.lineStyle === 'dotted' ? '2,4' : 'none')}
        fill="none"
        markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
        className="transition-all hover:stroke-[3px]"
        style={{ transitionProperty: 'stroke-width' }}
      />

      {/* Hit area for easier clicking */}
      <path d={d} stroke="transparent" strokeWidth={20} fill="none" />

      {!editing && conn.label && (
        <g className="pointer-events-none">
          <rect
            x={midX - (conn.label.length * 4) - 8}
            y={midY - 18}
            width={conn.label.length * 8 + 16}
            height={18}
            rx={9}
            fill="var(--bg-toolbar)"
            stroke="var(--border-subtle)"
            strokeWidth={0.75}
          />
          <text
            x={midX}
            y={midY - 5}
            fill="var(--text-secondary)"
            fontSize="10"
            fontWeight={600}
            textAnchor="middle"
            className="select-none"
          >
            {conn.label}
          </text>
        </g>
      )}

      {isSelected && (
        <foreignObject x={midX - 82} y={midY - 48} width="164" height="96" className="overflow-visible">
          <div className="flex flex-col items-center gap-1">
            {editing ? (
              <input
                autoFocus
                type="text"
                defaultValue={conn.label || ''}
                placeholder="Label..."
                className="w-full bg-obsidian-input border border-accent text-obsidian-text text-xs px-2 py-1 rounded outline-none text-center"
                onBlur={(e) => commitLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitLabel(e.currentTarget.value);
                  if (e.key === 'Escape') setEditing(false);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="text-[10px] bg-obsidian-surface px-2 py-0.5 rounded-full border border-obsidian-border text-obsidian-textMuted whitespace-nowrap" style={{ boxShadow: 'var(--shadow-card)' }}>
                Double-click to edit label
              </div>
            )}

            {!editing && (
              <div
                className="flex items-center gap-1 bg-obsidian-toolbar border border-obsidian-border rounded p-1 pointer-events-auto"
                style={{ boxShadow: 'var(--shadow-pop)' }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  title="Cycle Line Type"
                  onClick={cycleLineType}
                  className="px-2 py-1 text-[10px] bg-obsidian-surface hover:bg-obsidian-input text-obsidian-text rounded transition-colors"
                >
                  {conn.lineType || 'bezier'}
                </button>
                <div className="relative">
                  <button
                    title="Change Connection Color"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!colorPickerOpen) pushHistory();
                      setColorPickerOpen((v) => !v);
                    }}
                    className="flex items-center gap-1 p-1 text-[10px] bg-obsidian-surface hover:bg-obsidian-input text-obsidian-text rounded transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-obsidian-border/60"
                      style={{ backgroundColor: conn.color || '#666' }}
                    />
                    <Palette size={11} />
                  </button>
                  {colorPickerOpen && (
                    <div className="absolute bottom-7 left-0 z-50">
                      <ColorPicker connectionId={conn.id} onClose={() => setColorPickerOpen(false)} />
                    </div>
                  )}
                </div>
                <button
                  title="Delete Connection"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConnection(conn.id);
                  }}
                  className="p-1 text-[10px] bg-obsidian-surface hover:bg-red-500/20 hover:text-red-400 text-obsidian-text rounded transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
});

ConnectionLine.displayName = 'ConnectionLine';

export const ConnectionLayer: React.FC = () => {
  const elements = useCanvasStore((state) => state.elements);
  const connections = useCanvasStore((state) => state.connections);
  const viewport = useCanvasStore((state) => state.viewport);
  const draftConnection = useCanvasStore((state) => state.draftConnection);

  const [draftMouse, setDraftMouse] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!draftConnection) {
      setDraftMouse(null);
      return;
    }
    const onMove = (e: MouseEvent) => setDraftMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [draftConnection]);

  const getPortPos = (elId: string, side: 'top' | 'right' | 'bottom' | 'left') => {
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

  const draftFromPos = draftConnection ? getPortPos(draftConnection.fromId, draftConnection.fromSide) : null;
  let draftPath = '';
  if (draftConnection && draftFromPos && draftMouse) {
    const cursor = {
      x: (draftMouse.x - viewport.panX) / viewport.zoom,
      y: (draftMouse.y - viewport.panY) / viewport.zoom,
    };
    draftPath = computePath(draftFromPos, cursor, draftConnection.fromSide, 'right', 'bezier');
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2, overflow: 'visible' }}
    >
      <defs>
        <marker id="arrow-default" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#888" />
        </marker>
        <marker id="arrow-selected" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
        </marker>
      </defs>

      <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
        {connections.map((conn) => {
          const fromPos = getPortPos(conn.fromId, conn.fromSide);
          const toPos = getPortPos(conn.toId, conn.toSide);
          if (!fromPos || !toPos) return null;
          return (
            <ConnectionLine
              key={conn.id}
              conn={conn}
              fx={fromPos.x}
              fy={fromPos.y}
              tx={toPos.x}
              ty={toPos.y}
            />
          );
        })}

        {/* Live draft connection preview */}
        {draftConnection && draftFromPos && draftMouse && (
          <g className="pointer-events-none">
            <path
              d={draftPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.5}
              strokeDasharray="6,6"
            />
            <circle
              cx={(draftMouse.x - viewport.panX) / viewport.zoom}
              cy={(draftMouse.y - viewport.panY) / viewport.zoom}
              r={6}
              fill="var(--accent)"
              opacity={0.4}
            />
          </g>
        )}

        {draftConnection && (
          <g className="pointer-events-none">
            <rect
              x={(draftMouse ? draftMouse.x - viewport.panX : 0) / viewport.zoom - 45}
              y={(draftMouse ? draftMouse.y - viewport.panY : 0) / viewport.zoom - 42}
              width={128}
              height={18}
              rx={9}
              fill="var(--bg-toolbar)"
              stroke="var(--border-subtle)"
              strokeWidth={0.75}
            />
            <text
              x={(draftMouse ? draftMouse.x - viewport.panX : 0) / viewport.zoom}
              y={(draftMouse ? draftMouse.y - viewport.panY : 0) / viewport.zoom - 29}
              fontSize="10"
              fill="var(--text-secondary)"
              textAnchor="middle"
              className="select-none"
            >
              Release on a port to connect
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};