import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';

export const MathNode: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(element.latex || 'E = mc^2');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing && containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        containerRef.current.innerText = 'LaTeX Error';
      }
    }
  }, [latex, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    updateElement(element.id, { latex });
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center cursor-text"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          className="w-full h-full bg-obsidian-input text-obsidian-text outline-none resize-none p-2 font-mono text-sm border border-accent/50 rounded"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center text-obsidian-text overflow-hidden" />
      )}
    </div>
  );
};
