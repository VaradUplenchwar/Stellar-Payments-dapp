import React, { useEffect } from 'react';
import { 
  Copy, Trash2, BringToFront, SendToBack,
  FileText, StickyNote as StickyIcon, Code, Image as ImageIcon, Square, Maximize
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface ContextMenuProps {
  x: number;
  y: number;
  targetId: string | null;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetId, onClose }) => {
  const deleteSelected = useCanvasStore((state) => state.deleteSelected);
  const duplicateSelected = useCanvasStore((state) => state.duplicateSelected);
  const bringToFront = useCanvasStore((state) => state.bringToFront);
  const sendToBack = useCanvasStore((state) => state.sendToBack);
  const addElement = useCanvasStore((state) => state.addElement);
  const viewport = useCanvasStore((state) => state.viewport);
  const fitToContent = useCanvasStore((state) => state.fitToContent);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('mousedown', handler);
    window.addEventListener('wheel', handler);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('wheel', handler);
    };
  }, [onClose]);

  const canvasPos = {
    x: (x - viewport.panX) / viewport.zoom,
    y: (y - viewport.panY) / viewport.zoom,
  };

  const elementActions = targetId ? [
    { label: 'Duplicate', icon: <Copy size={14} />, action: () => duplicateSelected() },
    { label: 'Bring to Front', icon: <BringToFront size={14} />, action: () => bringToFront(targetId) },
    { label: 'Send to Back', icon: <SendToBack size={14} />, action: () => sendToBack(targetId) },
    { label: 'Delete', icon: <Trash2 size={14} />, action: () => deleteSelected(), danger: true },
  ] : [];

  const canvasActions = [
    { label: 'Add Note here', icon: <FileText size={14} />, action: () => addElement('note', canvasPos.x - 130, canvasPos.y - 80) },
    { label: 'Add Sticky here', icon: <StickyIcon size={14} />, action: () => addElement('sticky', canvasPos.x - 100, canvasPos.y - 100) },
    { label: 'Add Code here', icon: <Code size={14} />, action: () => addElement('code', canvasPos.x - 160, canvasPos.y - 90) },
    { label: 'Add Image here', icon: <ImageIcon size={14} />, action: () => addElement('image', canvasPos.x - 150, canvasPos.y - 120) },
    { label: 'Add Shape here', icon: <Square size={14} />, action: () => addElement('shape', canvasPos.x - 80, canvasPos.y - 60) },
    { label: 'Fit All Content', icon: <Maximize size={14} />, action: () => fitToContent() },
  ];

  const menuItems = targetId ? [...elementActions, null, ...canvasActions] : canvasActions;

  return (
    <div
      className="fixed z-[100] bg-obsidian-surface border border-obsidian-border rounded-xl py-1.5 text-obsidian-text overflow-hidden min-w-[180px]"
      style={{ left: x, top: y, boxShadow: 'var(--shadow-pop)' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, i) =>
        item === null ? (
          <div key={`divider-${i}`} className="h-px bg-obsidian-border my-1 mx-2" />
        ) : (
          <button
            key={item.label}
            onClick={() => { item.action(); onClose(); }}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-obsidian-input transition-colors ${
              'danger' in item && item.danger ? 'text-red-400 hover:text-red-300' : 'text-obsidian-text'
            }`}
          >
            <span className="opacity-70">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
};
