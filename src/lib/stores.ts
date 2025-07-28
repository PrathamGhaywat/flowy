import { writable } from 'svelte/store';
import type { FlowchartData, FlowchartNode, Connection, DragState, GridSettings, CanvasState } from './types';

// Main flowchart data store
export const flowchartData = writable<FlowchartData>({
  nodes: [],
  connections: []
});

// Drag state store
export const dragState = writable<DragState>({
  isDragging: false,
  draggedNodeId: null,
  startPosition: { x: 0, y: 0 },
  offset: { x: 0, y: 0 }
});

// Grid settings store
export const gridSettings = writable<GridSettings>({
  size: 20,
  enabled: true
});

// Canvas state store
export const canvasState = writable<CanvasState>({
  zoom: 1,
  pan: { x: 0, y: 0 },
  selection: []
});

// Utility functions for working with the stores
export function addNode(node: FlowchartNode) {
  flowchartData.update(data => ({
    ...data,
    nodes: [...data.nodes, node]
  }));
}

export function updateNode(nodeId: string, updates: Partial<FlowchartNode>) {
  flowchartData.update(data => ({
    ...data,
    nodes: data.nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    )
  }));
}

export function removeNode(nodeId: string) {
  flowchartData.update(data => ({
    nodes: data.nodes.filter(node => node.id !== nodeId),
    connections: data.connections.filter(conn => 
      conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    )
  }));
}

export function addConnection(connection: Connection) {
  flowchartData.update(data => ({
    ...data,
    connections: [...data.connections, connection]
  }));
}

export function removeConnection(connectionId: string) {
  flowchartData.update(data => ({
    ...data,
    connections: data.connections.filter(conn => conn.id !== connectionId)
  }));
}

export function clearSelection() {
  flowchartData.update(data => ({
    ...data,
    nodes: data.nodes.map(node => ({ ...node, selected: false }))
  }));
  canvasState.update(state => ({ ...state, selection: [] }));
}

export function selectNode(nodeId: string, addToSelection = false) {
  if (!addToSelection) {
    clearSelection();
  }
  
  flowchartData.update(data => ({
    ...data,
    nodes: data.nodes.map(node => 
      node.id === nodeId ? { ...node, selected: true } : node
    )
  }));
  
  canvasState.update(state => ({
    ...state,
    selection: addToSelection 
      ? [...state.selection, nodeId]
      : [nodeId]
  }));
}
