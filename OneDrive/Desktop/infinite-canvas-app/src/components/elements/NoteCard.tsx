import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';

export const NoteCard: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || '');

  useEffect(() => {
    if (!isEditing && element.content !== undefined) {
      setText(element.content || '');
    }
  }, [element.content, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    updateElement(element.id, { content: text });
  };

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code class="bg-obsidian-input px-1 py-0.5 rounded text-[0.9em]">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-accent underline underline-offset-2">$1</a>');

  const renderMarkdown = (content: string) => {
    if (!content) return <span className="text-obsidian-textMuted italic">Double click to add note content...</span>;

    const lines = content.split('\n');
    const html: string[] = [];
    let inList = false;
    const closeList = () => {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    };

    lines.forEach((line) => {
      const bullet = line.match(/^[-*]\s+(.*)$/);
      if (bullet) {
        if (!inList) {
          html.push('<ul class="ml-3 space-y-0.5">');
          inList = true;
        }
        html.push(`<li>${inline(bullet[1])}</li>`);
        return;
      }
      closeList();

      const heading = line.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        const lvl = heading[1].length;
        const cls = lvl === 1 ? 'text-lg' : lvl === 2 ? 'text-base' : 'text-sm';
        html.push(`<${'h' + lvl} class="font-bold my-1 text-accent ${cls}">${inline(heading[2])}</${'h' + lvl}>`);
        return;
      }

      if (line.trim()) html.push(`<p class="my-0.5">${inline(line)}</p>`);
    });

    closeList();
    return <div dangerouslySetInnerHTML={{ __html: html.join('') }} />;
  };

  return (
    <div className="w-full h-full text-sm" onDoubleClick={() => setIsEditing(true)}>
      {isEditing ? (
        <textarea
          className="w-full h-full bg-transparent text-obsidian-text outline-none resize-none font-mono text-xs"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onPointerDown={(e) => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <div className="max-w-none text-obsidian-text overflow-auto">
          {renderMarkdown(element.content || '')}
        </div>
      )}
    </div>
  );
};