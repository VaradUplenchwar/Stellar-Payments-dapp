import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';
import { CheckSquare, Square } from 'lucide-react';

export const ChecklistCard: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);

  const items = element.items || [];

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    updateElement(element.id, { items: updated });
  };

  const addItem = () => {
    const newId = 'ci_' + Date.now();
    updateElement(element.id, {
      items: [...items, { id: newId, text: 'New task', done: false }],
    });
  };

  const updateItemText = (id: string, text: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    updateElement(element.id, { items: updated });
  };

  const removeItem = (id: string) => {
    updateElement(element.id, { items: items.filter((i) => i.id !== id) });
  };

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="w-full h-full flex flex-col gap-1.5 overflow-auto">
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1.5 bg-obsidian-toolbar rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-obsidian-textMuted">
            {doneCount}/{items.length}
          </span>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2 group">
          <button
            onClick={() => toggleItem(item.id)}
            className="mt-0.5 flex-shrink-0 text-obsidian-textMuted hover:text-accent transition-colors"
          >
            {item.done ? (
              <CheckSquare size={15} className="text-accent" />
            ) : (
              <Square size={15} />
            )}
          </button>
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItemText(item.id, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex-1 bg-transparent outline-none text-xs border-b border-transparent focus:border-obsidian-border/50 transition-colors ${
              item.done ? 'line-through text-obsidian-textMuted' : 'text-obsidian-text'
            }`}
          />
          <button
            onClick={() => removeItem(item.id)}
            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs transition-all px-1"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        onPointerDown={(e) => e.stopPropagation()}
        className="mt-1 text-[11px] text-obsidian-textMuted hover:text-accent transition-colors text-left"
      >
        + Add item
      </button>
    </div>
  );
};
