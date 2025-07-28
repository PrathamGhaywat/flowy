// Types for the flowchart system

export interface Position {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

export type NodeType = 'process' | 'decision' | 'input' | 'output';

export interface FlowchartNode {
  id: string;
  type: NodeType;
  position: Position;
  size: NodeSize;
  text: string;
  selected: boolean;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPoint: Position;
  toPoint: Position;
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  connections: Connection[];
}

export interface DragState {
  isDragging: boolean;
  draggedNodeId: string | null;
  startPosition: Position;
  offset: Position;
}

export interface GridSettings {
  size: number;
  enabled: boolean;
}

export interface CanvasState {
  zoom: number;
  pan: Position;
  selection: string[];
}
