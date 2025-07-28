<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FlowchartNode } from '../lib/types';
  import { dragState, gridSettings } from '../lib/stores';
  import { snapToGrid } from '../lib/utils';

  export let node: FlowchartNode;
  
  const dispatch = createEventDispatcher<{
    nodeUpdate: { id: string; updates: Partial<FlowchartNode> };
    nodeSelect: { id: string; addToSelection: boolean };
    nodeDelete: { id: string };
    connectionStart: { nodeId: string; position: { x: number; y: number }; side: string };
  }>();

  let isEditing = false;
  let textInput: HTMLInputElement;

  function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    
    // Get canvas element to calculate proper coordinates
    const canvasElement = document.querySelector('.flowchart-canvas') as HTMLElement;
    if (!canvasElement) return;
    
    const canvasRect = canvasElement.getBoundingClientRect();
    const nodeRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculate offset relative to canvas
    const offset = {
      x: nodeRect.left - canvasRect.left - node.position.x,
      y: nodeRect.top - canvasRect.top - node.position.y
    };

    dragState.set({
      isDragging: true,
      draggedNodeId: node.id,
      startPosition: { x: event.clientX, y: event.clientY },
      offset
    });

    dispatch('nodeSelect', { id: node.id, addToSelection: event.ctrlKey });

    function handleMouseMove(event: MouseEvent) {
      if ($dragState.isDragging && $dragState.draggedNodeId === node.id) {
        // Calculate new position relative to canvas
        const newPosition = {
          x: event.clientX - canvasRect.left - offset.x,
          y: event.clientY - canvasRect.top - offset.y
        };

        const snappedPosition = snapToGrid(newPosition, $gridSettings);
        
        dispatch('nodeUpdate', {
          id: node.id,
          updates: { position: snappedPosition }
        });
      }
    }

    function handleMouseUp() {
      dragState.set({
        isDragging: false,
        draggedNodeId: null,
        startPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleDoubleClick() {
    isEditing = true;
    setTimeout(() => {
      textInput?.focus();
      textInput?.select();
    }, 0);
  }

  function handleTextSubmit() {
    isEditing = false;
    dispatch('nodeUpdate', {
      id: node.id,
      updates: { text: node.text }
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleTextSubmit();
    } else if (event.key === 'Escape') {
      isEditing = false;
    } else if (event.key === 'Delete' && !isEditing) {
      dispatch('nodeDelete', { id: node.id });
    }
  }

  function getNodeShape(type: string) {
    switch (type) {
      case 'decision':
        return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'input':
        return 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)';
      case 'output':
        return 'polygon(0% 0%, 90% 0%, 100% 100%, 10% 100%)';
      default:
        return 'none';
    }
  }

  function getNodeColor(type: string) {
    switch (type) {
      case 'process': return '#4CAF50';
      case 'decision': return '#FF9800';
      case 'input': return '#2196F3';
      case 'output': return '#9C27B0';
      default: return '#757575';
    }
  }

  function handleConnectionPointMouseDown(event: MouseEvent, side: string) {
    event.stopPropagation();
    event.preventDefault();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const connectionPoint = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    dispatch('connectionStart', { 
      nodeId: node.id, 
      position: connectionPoint,
      side
    });
  }
</script>

<div
  class="flowchart-node"
  class:selected={node.selected}
  style="
    left: {node.position.x}px;
    top: {node.position.y}px;
    width: {node.size.width}px;
    height: {node.size.height}px;
    clip-path: {getNodeShape(node.type)};
    background-color: {getNodeColor(node.type)};
  "
  on:mousedown={handleMouseDown}
  on:dblclick={handleDoubleClick}
  on:keydown={handleKeyDown}
  tabindex="0"
  role="button"
  aria-label="Flowchart node: {node.text}"
>
  {#if isEditing}
    <input
      bind:this={textInput}
      bind:value={node.text}
      class="node-text-input"
      on:blur={handleTextSubmit}
      on:keydown={handleKeyDown}
      maxlength="50"
    />
  {:else}
    <div class="node-text">{node.text}</div>
  {/if}
  
  <!-- Connection points -->
  <div 
    class="connection-point left" 
    data-side="left"
    on:mousedown={(e) => handleConnectionPointMouseDown(e, 'left')}
    role="button"
    tabindex="-1"
    aria-label="Left connection point"
  ></div>
  <div 
    class="connection-point right" 
    data-side="right"
    on:mousedown={(e) => handleConnectionPointMouseDown(e, 'right')}
    role="button"
    tabindex="-1"
    aria-label="Right connection point"
  ></div>
  <div 
    class="connection-point top" 
    data-side="top"
    on:mousedown={(e) => handleConnectionPointMouseDown(e, 'top')}
    role="button"
    tabindex="-1"
    aria-label="Top connection point"
  ></div>
  <div 
    class="connection-point bottom" 
    data-side="bottom"
    on:mousedown={(e) => handleConnectionPointMouseDown(e, 'bottom')}
    role="button"
    tabindex="-1"
    aria-label="Bottom connection point"
  ></div>
</div>

<style>
  .flowchart-node {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 0, 0, 0.2);
    cursor: move;
    user-select: none;
    transition: all 0.2s ease;
    color: white;
    font-weight: 500;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .flowchart-node:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .flowchart-node.selected {
    border-color: #007ACC;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .node-text {
    padding: 8px 12px;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .node-text-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    outline: none;
    width: 90%;
    padding: 6px 8px;
  }

  .node-text-input:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .connection-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #007ACC;
    border: 2px solid white;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.2s ease;
    cursor: crosshair;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .flowchart-node:hover .connection-point {
    opacity: 1;
    pointer-events: all;
  }

  .connection-point:hover {
    transform: scale(1.2);
    background: #0056b3;
  }

  .connection-point.left {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
  }

  .connection-point.right {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
  }

  .connection-point.top {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
  }

  .connection-point.bottom {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
  }

  .connection-point:hover.left {
    transform: translateY(-50%) scale(1.2);
  }

  .connection-point:hover.right {
    transform: translateY(-50%) scale(1.2);
  }

  .connection-point:hover.top {
    transform: translateX(-50%) scale(1.2);
  }

  .connection-point:hover.bottom {
    transform: translateX(-50%) scale(1.2);
  }
</style>
