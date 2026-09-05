import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasElement } from '../../types/canvas';

export const ImageCard: React.FC<{ element: CanvasElement }> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [url, setUrl] = useState(element.imageUrl || '');
  const prevImageUrl = useRef(element.imageUrl);

  useEffect(() => {
    if (element.imageUrl !== prevImageUrl.current) {
      prevImageUrl.current = element.imageUrl;
      setUrl(element.imageUrl || '');
    }
  }, [element.imageUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setUrl(src);
        updateElement(element.id, { imageUrl: src, ocrText: 'Extracted text preview from uploaded image...' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2 overflow-hidden">
      {element.imageUrl ? (
        <img
          src={element.imageUrl}
          alt="Canvas Node"
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-obsidian-textMuted p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id={`img-input-${element.id}`}
          />
          <label
            htmlFor={`img-input-${element.id}`}
            className="cursor-pointer bg-accent/15 text-accent border border-accent/30 px-3 py-1.5 rounded text-xs font-semibold hover:bg-accent/25 transition-colors"
          >
            Upload Image
          </label>
          <span className="text-[11px] opacity-70">or paste image URL below</span>
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => updateElement(element.id, { imageUrl: url })}
            className="w-full bg-obsidian-input px-2 py-1 rounded text-xs outline-none text-obsidian-text border border-obsidian-border"
          />
        </div>
      )}
    </div>
  );
};
