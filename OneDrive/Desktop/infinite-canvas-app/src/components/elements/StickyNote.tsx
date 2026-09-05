import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';

export const StickyNote: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [text, setText] = useState(element.content || '');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && element.content !== undefined) {
      setText(element.content || '');
    }
  }, [element.content]);

  return (
    <textarea
      ref={ref}
      className="w-full h-full bg-transparent text-amber-100 font-sans text-sm outline-none resize-none placeholder-amber-400/50"
      placeholder="Type sticky note..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => updateElement(element.id, { content: text })}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
};