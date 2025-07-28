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
    connectionStart: { nodeId: string; position: { x: number; y: number } };
  }>();

  let isEditing = false;
  let textInput: HTMLInputElement;

  function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    dragState.set({
      isDragging: true,
      draggedNodeId: node.id,
      startPosition: { x: event.clientX, y: event.clientY },
      offset
    });

    dispatch('nodeSelect', { id: node.id, addToSelection: event.ctrlKey });

    function handleMouseMove(event: MouseEvent) {
      dragState.update(state => {
        if (state.isDragging && state.draggedNodeId === node.id) {
          const newPosition = {
            x: event.clientX - state.offset.x,
            y: event.clientY - state.offset.y
          };

          const snappedPosition = snapToGrid(newPosition, $gridSettings);
          
          dispatch('nodeUpdate', {
            id: node.id,
            updates: { position: snappedPosition }
          });
        }
        return state;
      });
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
  <div class="connection-point left" data-side="left"></div>
  <div class="connection-point right" data-side="right"></div>
  <div class="connection-point top" data-side="top"></div>
  <div class="connection-point bottom" data-side="bottom"></div>
</div>

<style>
  .flowchart-node {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #333;
    cursor: move;
    user-select: none;
    transition: box-shadow 0.2s ease;
    color: white;
    font-weight: 500;
    font-size: 14px;
  }

  .flowchart-node:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .flowchart-node.selected {
    border-color: #007ACC;
    box-shadow: 0 0 0 2px #007ACC;
  }

  .node-text {
    padding: 8px;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
  }

  .node-text-input {
    background: transparent;
    border: none;
    color: white;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    width: 90%;
    padding: 4px;
  }

  .connection-point {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #007ACC;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .flowchart-node:hover .connection-point {
    opacity: 1;
  }

  .connection-point.left {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }

  .connection-point.right {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
  }

  .connection-point.top {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  .connection-point.bottom {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
