<script lang="ts">
  import { onMount } from 'svelte';
  import { flowchartData, gridSettings, canvasState, dragState, addNode, updateNode, removeNode, addConnection, removeConnection, selectNode, clearSelection } from '../lib/stores';
  import { generateId, snapToGrid, getConnectionPoints, isPointInNode } from '../lib/utils';
  import FlowchartNode from './FlowchartNode.svelte';
  import NodeConnection from './NodeConnection.svelte';
  import type { FlowchartNode as FlowchartNodeType, NodeType, Position } from '../lib/types';

  let canvasElement: HTMLDivElement;
  let svgElement: SVGSVGElement;
  let isConnecting = false;
  let connectionStart: { nodeId: string; position: Position; side: string } | null = null;
  let tempConnection: { from: Position; to: Position } | null = null;

  function handleCanvasClick(event: MouseEvent) {
    if (event.target === canvasElement || event.target === svgElement) {
      clearSelection();
    }
  }

  function handleCanvasKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Delete all selected nodes
      const selectedNodes = $flowchartData.nodes.filter(node => node.selected);
      selectedNodes.forEach(node => {
        removeNode(node.id);
      });
    } else if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function handleCanvasDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      try {
        const { type, nodeType } = JSON.parse(data);
        if (type === 'node') {
          createNode(nodeType, getMousePosition(event));
        }
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  }

  function handleCanvasDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function getMousePosition(event: MouseEvent | DragEvent): Position {
    const rect = canvasElement.getBoundingClientRect();
    const zoom = $canvasState.zoom;
    const pan = $canvasState.pan;
    
    return {
      x: (event.clientX - rect.left - pan.x) / zoom,
      y: (event.clientY - rect.top - pan.y) / zoom
    };
  }

  function createNode(type: NodeType, position: Position) {
    const nodeSize = {
      width: type === 'decision' ? 120 : 100,
      height: type === 'decision' ? 80 : 60
    };

    const snappedPosition = snapToGrid(position, $gridSettings);

    const newNode: FlowchartNodeType = {
      id: generateId(),
      type,
      position: snappedPosition,
      size: nodeSize,
      text: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      selected: false
    };

    addNode(newNode);
  }

  function handleNodeUpdate(event: CustomEvent<{ id: string; updates: Partial<FlowchartNodeType> }>) {
    const { id, updates } = event.detail;
    updateNode(id, updates);

    // Update connections if node position changed
    if (updates.position) {
      updateNodeConnections(id);
    }
  }

  function handleNodeSelect(event: CustomEvent<{ id: string; addToSelection: boolean }>) {
    const { id, addToSelection } = event.detail;
    selectNode(id, addToSelection);
    
    // Focus the canvas so keyboard events work
    setTimeout(() => {
      canvasElement?.focus();
    }, 0);
  }

  function handleNodeDelete(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    removeNode(id);
  }

  function handleConnectionStart(event: CustomEvent<{ nodeId: string; position: Position; side: string }>) {
    const { nodeId, position, side } = event.detail;
    const canvasRect = canvasElement.getBoundingClientRect();
    
    // Convert screen coordinates to canvas coordinates
    const canvasPosition = {
      x: (position.x - canvasRect.left - $canvasState.pan.x) / $canvasState.zoom,
      y: (position.y - canvasRect.top - $canvasState.pan.y) / $canvasState.zoom
    };
    
    connectionStart = { nodeId, position: canvasPosition, side };
    isConnecting = true;
    tempConnection = {
      from: canvasPosition,
      to: canvasPosition
    };
  }

  function handleConnectionDelete(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    removeConnection(id);
  }

  function updateNodeConnections(nodeId: string) {
    flowchartData.update(data => {
      const node = data.nodes.find(n => n.id === nodeId);
      if (!node) return data;

      const updatedConnections = data.connections.map(conn => {
        if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
          const fromNode = data.nodes.find(n => n.id === conn.fromNodeId);
          const toNode = data.nodes.find(n => n.id === conn.toNodeId);
          
          if (fromNode && toNode) {
            const points = getConnectionPoints(fromNode, toNode);
            return {
              ...conn,
              fromPoint: points.from,
              toPoint: points.to
            };
          }
        }
        return conn;
      });

      return { ...data, connections: updatedConnections };
    });
  }

  function handleMouseMove(event: MouseEvent) {
    if (isConnecting && tempConnection) {
      const mousePos = getMousePosition(event);
      tempConnection = {
        ...tempConnection,
        to: mousePos
      };
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (isConnecting && connectionStart) {
      const mousePos = getMousePosition(event);
      
      // Find node under mouse
      const targetNode = $flowchartData.nodes.find(node => 
        isPointInNode(mousePos, node) && node.id !== connectionStart.nodeId
      );

      if (targetNode) {
        // Create connection
        const fromNode = $flowchartData.nodes.find(n => n.id === connectionStart.nodeId);
        if (fromNode) {
          const points = getConnectionPoints(fromNode, targetNode);
          const newConnection = {
            id: generateId(),
            fromNodeId: connectionStart.nodeId,
            toNodeId: targetNode.id,
            fromPoint: points.from,
            toPoint: points.to
          };
          addConnection(newConnection);
        }
      }

      // Reset connection state
      isConnecting = false;
      connectionStart = null;
      tempConnection = null;
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    
    const rect = canvasElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const oldZoom = $canvasState.zoom;
    const newZoom = Math.max(0.1, Math.min(3, oldZoom * delta));
    
    // Calculate the zoom point in world coordinates
    const worldX = (mouseX - $canvasState.pan.x) / oldZoom;
    const worldY = (mouseY - $canvasState.pan.y) / oldZoom;
    
    // Calculate new pan to keep the point under the mouse
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    
    canvasState.update(state => ({
      ...state,
      zoom: newZoom,
      pan: { x: newPanX, y: newPanY }
    }));
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  // Grid pattern - Excalidraw style
  $: gridPattern = $gridSettings.enabled ? 
    `radial-gradient(circle, #d1d5db 1px, transparent 1px)` :
    'none';
  
  $: gridSize = $gridSettings.size * $canvasState.zoom;
</script>

<div 
  class="flowchart-canvas"
  bind:this={canvasElement}
  on:click={handleCanvasClick}
  on:drop={handleCanvasDrop}
  on:dragover={handleCanvasDragOver}
  on:wheel={handleWheel}
  on:keydown={handleCanvasKeyDown}
  role="application"
  aria-label="Flowchart canvas - Press Delete to remove selected nodes"
  tabindex="0"
  style="
    background-image: {gridPattern};
    background-size: {gridSize}px {gridSize}px;
    background-position: {$canvasState.pan.x}px {$canvasState.pan.y}px;
  "
>
  <!-- SVG for connections -->
  <svg 
    class="connections-layer"
    bind:this={svgElement}
    width="100%"
    height="100%"
    style="transform: translate({$canvasState.pan.x}px, {$canvasState.pan.y}px) scale({$canvasState.zoom});"
  >
    <!-- Existing connections -->
    {#each $flowchartData.connections as connection (connection.id)}
      <NodeConnection 
        {connection} 
        on:connectionDelete={handleConnectionDelete}
      />
    {/each}
    
    <!-- Temporary connection while dragging -->
    {#if tempConnection}
      <path
        d="M {tempConnection.from.x} {tempConnection.from.y} L {tempConnection.to.x} {tempConnection.to.y}"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-dasharray="5,5"
        fill="none"
      />
    {/if}
  </svg>

  <!-- Nodes layer -->
  <div class="nodes-layer" style="transform: translate({$canvasState.pan.x}px, {$canvasState.pan.y}px) scale({$canvasState.zoom});">
    {#each $flowchartData.nodes as node (node.id)}
      <FlowchartNode 
        {node}
        on:nodeUpdate={handleNodeUpdate}
        on:nodeSelect={handleNodeSelect}
        on:nodeDelete={handleNodeDelete}
        on:connectionStart={handleConnectionStart}
      />
    {/each}
  </div>
</div>

<style>
  .flowchart-canvas {
    position: relative;
    width: 100%;
    height: 100%;
    background: #ffffff;
    overflow: hidden;
    cursor: default;
    transform-origin: 0 0;
    transition: transform 0.1s ease;
    outline: none;
  }

  .flowchart-canvas:focus {
    box-shadow: inset 0 0 0 2px #3b82f6;
  }

  .connections-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .connections-layer :global(.connection) {
    pointer-events: all;
  }

  .nodes-layer {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
</style>
