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
  let connectionStart: { nodeId: string; position: Position } | null = null;
  let tempConnection: { from: Position; to: Position } | null = null;

  function handleCanvasClick(event: MouseEvent) {
    if (event.target === canvasElement || event.target === svgElement) {
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
  }

  function handleNodeDelete(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    removeNode(id);
  }

  function handleConnectionStart(event: CustomEvent<{ nodeId: string; position: Position }>) {
    connectionStart = event.detail;
    isConnecting = true;
    tempConnection = {
      from: event.detail.position,
      to: event.detail.position
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
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, $canvasState.zoom * delta));
    
    canvasState.update(state => ({
      ...state,
      zoom: newZoom
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

  // Grid pattern
  $: gridPattern = $gridSettings.enabled ? 
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${$gridSettings.size}' height='${$gridSettings.size}' viewBox='0 0 ${$gridSettings.size} ${$gridSettings.size}'%3E%3Cpath d='M 0 0 L 0 ${$gridSettings.size} L ${$gridSettings.size} ${$gridSettings.size} L ${$gridSettings.size} 0 Z' fill='none' stroke='%23e0e0e0' stroke-width='1'/%3E%3C/svg%3E")` :
    'none';
</script>

<div 
  class="flowchart-canvas"
  bind:this={canvasElement}
  on:click={handleCanvasClick}
  on:drop={handleCanvasDrop}
  on:dragover={handleCanvasDragOver}
  on:wheel={handleWheel}
  style="
    background-image: {gridPattern};
    transform: scale({$canvasState.zoom}) translate({$canvasState.pan.x}px, {$canvasState.pan.y}px);
  "
>
  <!-- SVG for connections -->
  <svg 
    class="connections-layer"
    bind:this={svgElement}
    width="100%"
    height="100%"
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
        stroke="#007ACC"
        stroke-width="2"
        stroke-dasharray="5,5"
        fill="none"
      />
    {/if}
  </svg>

  <!-- Nodes layer -->
  <div class="nodes-layer">
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
    background: #f5f5f5;
    overflow: hidden;
    cursor: default;
    transform-origin: 0 0;
    transition: transform 0.1s ease;
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
