import React from 'react';

export const MarqueeSelector: React.FC<{
  isSelecting: boolean;
  startPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number } | null;
}> = ({ isSelecting, startPos, currentPos }) => {
  if (!isSelecting || !startPos || !currentPos) return null;

  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);

  return (
    <div
      className="absolute border border-accent bg-accent/10 pointer-events-none z-50 rounded-sm"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};
