import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';
import { Plus } from 'lucide-react';

export const MindMapNode: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const addMindMapBranch = useCanvasStore((state) => state.addMindMapBranch);

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || 'Central Idea');

  const handleBlur = () => {
    setIsEditing(false);
    updateElement(element.id, { content: text });
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      <div
        className="w-full h-full bg-transparent flex items-center justify-center p-3 text-center cursor-text"
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            className="w-full h-full bg-obsidian-input text-obsidian-text outline-none resize-none font-semibold text-center border border-accent rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-obsidian-text font-bold leading-tight">{text}</span>
        )}
      </div>

      {/* Quick Add Branches */}
      <button
        onClick={(e) => { e.stopPropagation(); addMindMapBranch(element.id, 'top'); }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent hover:opacity-85 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
        title="Add child above"
      >
        <Plus size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); addMindMapBranch(element.id, 'bottom'); }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent hover:opacity-85 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
        title="Add child below"
      >
        <Plus size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); addMindMapBranch(element.id, 'left'); }}
        className="absolute top-1/2 -translate-y-1/2 -left-8 w-6 h-6 bg-accent hover:opacity-85 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
        title="Add child to the left"
      >
        <Plus size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); addMindMapBranch(element.id, 'right'); }}
        className="absolute top-1/2 -translate-y-1/2 -right-8 w-6 h-6 bg-accent hover:opacity-85 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
        title="Add child to the right"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};