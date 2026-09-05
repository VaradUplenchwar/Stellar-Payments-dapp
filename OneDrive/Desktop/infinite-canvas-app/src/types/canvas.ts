export type ElementType = 
  | 'note' 
  | 'sticky' 
  | 'code' 
  | 'image' 
  | 'checklist' 
  | 'math' 
  | 'mindmap' 
  | 'shape';

export type ShapeKind = 'rectangle' | 'circle' | 'diamond' | 'arrow';

export type LineType = 'bezier' | 'straight' | 'step';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  color?: string; // 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
  locked?: boolean;
  
  // Element-specific payload
  title?: string;
  content?: string; // markdown or text
  language?: string; // for code block
  imageUrl?: string; // for image
  ocrText?: string; // extracted OCR text
  items?: { id: string; text: string; done: boolean }[]; // for checklist
  latex?: string; // for math
  shapeKind?: ShapeKind; // for shapes
  
  // Mindmap structure
  parentId?: string;
  childrenIds?: string[];
}

export interface Connection {
  id: string;
  fromId: string;
  fromSide: 'top' | 'right' | 'bottom' | 'left';
  toId: string;
  toSide: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
  color?: string;
  lineType?: LineType;
  lineStyle?: LineStyle;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  eraser?: boolean;
}

export type ToolMode = 
  | 'select' 
  | 'pan' 
  | 'pen' 
  | 'eraser' 
  | 'note' 
  | 'sticky' 
  | 'code' 
  | 'image' 
  | 'checklist' 
  | 'math' 
  | 'shape' 
  | 'connect';

export type AppTheme = 'obsidian' | 'light' | 'amoled';

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}
