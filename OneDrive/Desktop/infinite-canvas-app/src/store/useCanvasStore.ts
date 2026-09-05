import { create } from 'zustand';
import type { 
  CanvasElement, 
  Connection, 
  DrawingPath, 
  ElementType, 
  ToolMode, 
  AppTheme, 
  Viewport 
} from '../types/canvas';

interface HistorySnapshot {
  elements: CanvasElement[];
  connections: Connection[];
  drawings: DrawingPath[];
}

interface CanvasStoreState {
  elements: CanvasElement[];
  connections: Connection[];
  drawings: DrawingPath[];
  selectedIds: string[];
  viewport: Viewport;
  activeTool: ToolMode;
  activeTheme: AppTheme;
  penColor: string;
  penSize: number;
  draftConnection: { fromId: string; fromSide: 'top' | 'right' | 'bottom' | 'left' } | null;
  snapToGrid: boolean;
  gridSize: number;
  nextZIndex: number;

  // History stacks
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];

  // Actions
  setViewport: (viewport: Partial<Viewport>) => void;
  setActiveTool: (tool: ToolMode) => void;
  setTheme: (theme: AppTheme) => void;
  setPenColor: (color: string) => void;
  setPenSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;

  // Selection
  selectElement: (id: string, additive?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;

  // Element CRUD
  addElement: (type: ElementType, x: number, y: number, payload?: Partial<CanvasElement>) => CanvasElement;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  addMindMapBranch: (parentId: string, side: 'top' | 'right' | 'bottom' | 'left', content?: string) => void;

  // Connection CRUD
  startDraftConnection: (fromId: string, fromSide: 'top' | 'right' | 'bottom' | 'left') => void;
  cancelDraftConnection: () => void;
  createConnection: (toId: string, toSide: 'top' | 'right' | 'bottom' | 'left') => void;
  deleteConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;

  // Drawing
  addDrawingPath: (path: DrawingPath) => void;
  clearDrawings: () => void;

  // History & Utility
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  fitToContent: () => void;
  loadSampleData: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => void;
  resetCanvas: () => void;
}


export const useCanvasStore = create<CanvasStoreState>((set, get) => {
  const newId = (prefix: string) =>
    prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

  const saveSnapshot = (): HistorySnapshot => ({
    elements: JSON.parse(JSON.stringify(get().elements)),
    connections: JSON.parse(JSON.stringify(get().connections)),
    drawings: JSON.parse(JSON.stringify(get().drawings)),
  });

  return {
    elements: [],
    connections: [],
    drawings: [],
    selectedIds: [],
    viewport: { panX: 0, panY: 0, zoom: 1 },
    activeTool: 'select',
    activeTheme: 'obsidian',
    penColor: '#e5c07b',
    penSize: 3,
    draftConnection: null,
    snapToGrid: false,
    gridSize: 20,
    nextZIndex: 1,
    undoStack: [],
    redoStack: [],

    setViewport: (viewportUpdates) => {
      set((state) => ({
        viewport: { ...state.viewport, ...viewportUpdates },
      }));
    },

    setActiveTool: (tool) => {
      set({ activeTool: tool });
    },

    setTheme: (theme) => {
      set({ activeTheme: theme });
    },

    setPenColor: (color) => set({ penColor: color }),
    setPenSize: (size) => set({ penSize: size }),
    setSnapToGrid: (snap) => set({ snapToGrid: snap }),

    selectElement: (id, additive = false) => {
      set((state) => {
        if (additive) {
          const exists = state.selectedIds.includes(id);
          return {
            selectedIds: exists 
              ? state.selectedIds.filter((item) => item !== id)
              : [...state.selectedIds, id],
          };
        }
        return { selectedIds: [id] };
      });
    },

    selectMultiple: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),

    pushHistory: () => {
      const snap = saveSnapshot();
      set((state) => ({
        undoStack: [...state.undoStack.slice(-40), snap],
        redoStack: [],
      }));
    },

    addElement: (type, x, y, payload = {}) => {
      get().pushHistory();
      const id = newId('el');
      const zIndex = get().nextZIndex;

      let defaultWidth = 260;
      let defaultHeight = 160;

      if (type === 'sticky') { defaultWidth = 200; defaultHeight = 200; }
      else if (type === 'code') { defaultWidth = 340; defaultHeight = 220; }
      else if (type === 'shape') { defaultWidth = 160; defaultHeight = 120; }
      else if (type === 'image') { defaultWidth = 300; defaultHeight = 240; }

      const newElement: CanvasElement = {
        id,
        type,
        x,
        y,
        width: payload.width || defaultWidth,
        height: payload.height || defaultHeight,
        zIndex,
        color: payload.color || 'default',
        title: payload.title || (type === 'note' ? 'Note' : type.toUpperCase()),
        content: payload.content || '',
        language: payload.language || 'javascript',
        imageUrl: payload.imageUrl || '',
        latex: payload.latex || 'E = mc^2',
        shapeKind: payload.shapeKind || 'rectangle',
        items: payload.items || [
          { id: 't1', text: 'Task item 1', done: false },
          { id: 't2', text: 'Task item 2', done: true }
        ],
        ...payload,
      };

      set((state) => ({
        elements: [...state.elements, newElement],
        selectedIds: [id],
        nextZIndex: state.nextZIndex + 1,
      }));

      return newElement;
    },

    updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) => 
          el.id === id ? { ...el, ...updates } : el
        ),
      }));
    },

    removeElement: (id) => {
      get().pushHistory();
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        connections: state.connections.filter(
          (conn) => conn.fromId !== id && conn.toId !== id && conn.id !== id
        ),
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
      }));
    },

    deleteSelected: () => {
      const selected = get().selectedIds;
      if (selected.length === 0) return;
      get().pushHistory();

      set((state) => ({
        elements: state.elements.filter((el) => !selected.includes(el.id)),
        connections: state.connections.filter(
          (conn) => !selected.includes(conn.fromId) && !selected.includes(conn.toId) && !selected.includes(conn.id)
        ),
        selectedIds: [],
      }));
    },

    duplicateSelected: () => {
      const selected = get().selectedIds;
      if (selected.length === 0) return;
      get().pushHistory();

      const idMap: Record<string, string> = {};
      const newElements: CanvasElement[] = [];
      const newSelectedIds: string[] = [];
      let z = get().nextZIndex;

      selected.forEach((id) => {
        const el = get().elements.find((item) => item.id === id);
        if (el) {
          const newIdValue = newId('el');
          idMap[id] = newIdValue;
          newElements.push({
            ...JSON.parse(JSON.stringify(el)),
            id: newIdValue,
            x: el.x + 30,
            y: el.y + 30,
            zIndex: z++,
          });
          newSelectedIds.push(newIdValue);
        }
      });

      const newConnections = get().connections
        .filter((c) => idMap[c.fromId] && idMap[c.toId])
        .map((c) => ({
          ...JSON.parse(JSON.stringify(c)),
          id: newId('conn'),
          fromId: idMap[c.fromId],
          toId: idMap[c.toId],
        }));

      set((state) => ({
        elements: [...state.elements, ...newElements],
        connections: [...state.connections, ...newConnections],
        selectedIds: newSelectedIds,
        nextZIndex: z,
      }));
    },

    bringToFront: (id) => {
      set((state) => {
        const nextZ = state.nextZIndex + 1;
        return {
          elements: state.elements.map((el) => el.id === id ? { ...el, zIndex: nextZ } : el),
          nextZIndex: nextZ,
        };
      });
    },

    sendToBack: (id) => {
      set((state) => ({
        elements: state.elements.map((el) => el.id === id ? { ...el, zIndex: 0 } : el),
      }));
    },

    addMindMapBranch: (parentId, side, content = 'New Idea') => {
      const parent = get().elements.find((e) => e.id === parentId);
      if (!parent) return;

      get().pushHistory();

      let nx = parent.x;
      let ny = parent.y;
      let toSide: 'top' | 'right' | 'bottom' | 'left' =
        side === 'right' ? 'left' : side === 'left' ? 'right' : side === 'top' ? 'bottom' : 'top';

      if (side === 'right') { nx = parent.x + parent.width + 100; ny = parent.y + parent.height / 2 - 40; }
      else if (side === 'left') { nx = parent.x - 220; ny = parent.y + parent.height / 2 - 40; }
      else if (side === 'top') { nx = parent.x + parent.width / 2 - 100; ny = parent.y - 140; }
      else { nx = parent.x + parent.width / 2 - 100; ny = parent.y + parent.height + 60; }

      const childId = newId('el');
      const connId = newId('conn');
      const zIndex = get().nextZIndex;

      const child: CanvasElement = {
        id: childId,
        type: 'mindmap',
        x: nx,
        y: ny,
        width: 200,
        height: 80,
        zIndex,
        color: 'default',
        title: 'Mind Map',
        content,
        parentId,
      };

      set((state) => ({
        elements: [...state.elements, child],
        connections: [
          ...state.connections,
          {
            id: connId,
            fromId: parentId,
            fromSide: side,
            toId: childId,
            toSide,
            lineType: 'bezier',
            lineStyle: 'solid',
            color: '#3b82f6',
          },
        ],
        selectedIds: [childId],
        nextZIndex: state.nextZIndex + 1,
      }));
    },

    startDraftConnection: (fromId, fromSide) => {
      set({ draftConnection: { fromId, fromSide } });
    },

    cancelDraftConnection: () => {
      set({ draftConnection: null });
    },

    createConnection: (toId, toSide) => {
      const draft = get().draftConnection;
      if (!draft || draft.fromId === toId) {
        set({ draftConnection: null });
        return;
      }

      get().pushHistory();
      const connId = 'conn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const newConn: Connection = {
        id: connId,
        fromId: draft.fromId,
        fromSide: draft.fromSide,
        toId,
        toSide,
        lineType: 'bezier',
        lineStyle: 'solid',
        color: '#666',
      };

      set((state) => ({
        connections: [...state.connections, newConn],
        draftConnection: null,
      }));
    },

    deleteConnection: (id) => {
      get().pushHistory();
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
        selectedIds: state.selectedIds.filter((item) => item !== id),
      }));
    },

    updateConnection: (id, updates) => {
      set((state) => ({
        connections: state.connections.map((c) => c.id === id ? { ...c, ...updates } : c),
      }));
    },

    addDrawingPath: (path) => {
      get().pushHistory();
      set((state) => ({
        drawings: [...state.drawings, path],
      }));
    },

    clearDrawings: () => {
      get().pushHistory();
      set({ drawings: [] });
    },

    undo: () => {
      const { undoStack, redoStack } = get();
      if (undoStack.length === 0) return;

      const currentSnap = saveSnapshot();
      const prevSnap = undoStack[undoStack.length - 1];

      set({
        elements: prevSnap.elements,
        connections: prevSnap.connections,
        drawings: prevSnap.drawings,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, currentSnap],
      });
    },

    redo: () => {
      const { undoStack, redoStack } = get();
      if (redoStack.length === 0) return;

      const currentSnap = saveSnapshot();
      const nextSnap = redoStack[redoStack.length - 1];

      set({
        elements: nextSnap.elements,
        connections: nextSnap.connections,
        drawings: nextSnap.drawings,
        undoStack: [...undoStack, currentSnap],
        redoStack: redoStack.slice(0, -1),
      });
    },

    fitToContent: () => {
      const { elements } = get();
      if (elements.length === 0) {
        set({ viewport: { panX: 0, panY: 0, zoom: 1 } });
        return;
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      const margin = 100;

      const zoomX = (window.innerWidth - margin * 2) / width;
      const zoomY = (window.innerHeight - margin * 2) / height;
      const zoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.2), 1.5);

      const panX = (window.innerWidth / 2) - ((minX + width / 2) * zoom);
      const panY = (window.innerHeight / 2) - ((minY + height / 2) * zoom);

      set({ viewport: { panX, panY, zoom } });
    },

    loadSampleData: () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      const sampleElements: CanvasElement[] = [
        {
          id: 'note_1',
          type: 'note',
          x: cx - 320,
          y: cy - 180,
          width: 280,
          height: 220,
          zIndex: 1,
          color: 'blue',
          title: 'Project Requirements 🚀',
          content: '### Second Brain Canvas\n- **Local-first** architecture\n- Markdown notes & Code blocks\n- Drag, Connect & Organize thoughts visually',
        },
        {
          id: 'sticky_1',
          type: 'sticky',
          x: cx + 40,
          y: cy - 180,
          width: 220,
          height: 180,
          zIndex: 2,
          color: 'yellow',
          title: 'Quick Memo 💡',
          content: 'Press **Ctrl + Shift + P** to trigger the Command Palette!\n\nPress **?** to see all keyboard shortcuts.',
        },
        {
          id: 'code_1',
          type: 'code',
          x: cx - 320,
          y: cy + 80,
          width: 320,
          height: 180,
          zIndex: 3,
          color: 'purple',
          title: 'Custom Canvas Engine',
          language: 'typescript',
          content: `const screenToCanvas = (sx: number, sy: number) => {\n  return {\n    x: (sx - viewport.panX) / viewport.zoom,\n    y: (sy - viewport.panY) / viewport.zoom,\n  };\n};`,
        },
        {
          id: 'shape_1',
          type: 'shape',
          shapeKind: 'circle',
          x: cx + 80,
          y: cy + 80,
          width: 140,
          height: 140,
          zIndex: 4,
          color: 'green',
          title: 'Core System',
        }
      ];

      const sampleConnections: Connection[] = [
        {
          id: 'conn_1',
          fromId: 'note_1',
          fromSide: 'right',
          toId: 'sticky_1',
          toSide: 'left',
          label: 'relates to',
          lineType: 'bezier',
          lineStyle: 'solid',
          color: '#3b82f6',
        },
        {
          id: 'conn_2',
          fromId: 'note_1',
          fromSide: 'bottom',
          toId: 'code_1',
          toSide: 'top',
          label: 'implements',
          lineType: 'step',
          lineStyle: 'dashed',
          color: '#a855f7',
        }
      ];

      set({
        elements: sampleElements,
        connections: sampleConnections,
        nextZIndex: 10,
      });
    },

    exportJSON: () => {
      const data = {
        elements: get().elements,
        connections: get().connections,
        drawings: get().drawings,
        viewport: get().viewport,
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infinite-canvas-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importJSON: (jsonString) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.elements) {
          get().pushHistory();
          set({
            elements: data.elements || [],
            connections: data.connections || [],
            drawings: data.drawings || [],
            viewport: data.viewport || { panX: 0, panY: 0, zoom: 1 },
          });
        }
      } catch {
        alert('Invalid Canvas JSON file');
      }
    },

    resetCanvas: () => {
      get().pushHistory();
      set({
        elements: [],
        connections: [],
        drawings: [],
        selectedIds: [],
        viewport: { panX: 0, panY: 0, zoom: 1 },
        nextZIndex: 1,
      });
    },
  };
});
