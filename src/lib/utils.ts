import type { Position, GridSettings } from './types';

// Utility functions for the flowchart system

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function snapToGrid(position: Position, grid: GridSettings): Position {
  if (!grid.enabled) return position;
  
  return {
    x: Math.round(position.x / grid.size) * grid.size,
    y: Math.round(position.y / grid.size) * grid.size
  };
}

export function distance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getConnectionPoints(
  fromNode: { position: Position; size: { width: number; height: number } },
  toNode: { position: Position; size: { width: number; height: number } }
): { from: Position; to: Position } {
  const fromCenter = {
    x: fromNode.position.x + fromNode.size.width / 2,
    y: fromNode.position.y + fromNode.size.height / 2
  };
  
  const toCenter = {
    x: toNode.position.x + toNode.size.width / 2,
    y: toNode.position.y + toNode.size.height / 2
  };
  
  // Calculate which edges to connect (simplified - connects from right to left)
  const fromPoint = {
    x: fromNode.position.x + fromNode.size.width,
    y: fromCenter.y
  };
  
  const toPoint = {
    x: toNode.position.x,
    y: toCenter.y
  };
  
  return { from: fromPoint, to: toPoint };
}

export function isPointInNode(
  point: Position, 
  node: { position: Position; size: { width: number; height: number } }
): boolean {
  return (
    point.x >= node.position.x &&
    point.x <= node.position.x + node.size.width &&
    point.y >= node.position.y &&
    point.y <= node.position.y + node.size.height
  );
}

export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
