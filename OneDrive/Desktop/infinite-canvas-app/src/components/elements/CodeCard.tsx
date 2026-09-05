import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';

export const CodeCard: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [code, setCode] = useState(element.content || '');
  const [lang, setLang] = useState(element.language || 'javascript');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && element.content !== undefined) {
      setCode(element.content);
    }
  }, [element.content]);

  useEffect(() => {
    if (element.language) setLang(element.language);
  }, [element.language]);

  return (
    <div className="flex flex-col h-full gap-2 font-mono text-xs">
      <div className="flex justify-between items-center bg-obsidian-toolbar/80 px-2 py-1 rounded text-[11px] text-obsidian-textMuted">
        <select
          value={lang}
          onChange={(e) => {
            setLang(e.target.value);
            updateElement(element.id, { language: e.target.value });
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="bg-transparent text-accent outline-none cursor-pointer"
        >
          <option value="javascript" className="bg-obsidian-toolbar">JavaScript</option>
          <option value="typescript" className="bg-obsidian-toolbar">TypeScript</option>
          <option value="python" className="bg-obsidian-toolbar">Python</option>
          <option value="html" className="bg-obsidian-toolbar">HTML/CSS</option>
          <option value="rust" className="bg-obsidian-toolbar">Rust</option>
        </select>
        <span className="text-accent">code</span>
      </div>
      <textarea
        ref={ref}
        className="w-full flex-1 bg-obsidian-input/60 p-2 rounded text-emerald-300 outline-none resize-none font-mono text-xs leading-relaxed"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onBlur={() => updateElement(element.id, { content: code })}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="// Type code here..."
      />
    </div>
  );
};