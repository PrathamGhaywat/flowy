<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { NodeType } from '../lib/types';

  const dispatch = createEventDispatcher<{
    nodeCreate: { type: NodeType; position: { x: number; y: number } };
  }>();

  const nodeTypes: { type: NodeType; label: string; icon: string }[] = [
    { type: 'process', label: 'Process', icon: '⚙️' },
    { type: 'decision', label: 'Decision', icon: '❓' },
    { type: 'input', label: 'Input', icon: '📥' },
    { type: 'output', label: 'Output', icon: '📤' }
  ];

  function handleDragStart(event: DragEvent, nodeType: NodeType) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({ 
        type: 'node',
        nodeType 
      }));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  function handleClick(nodeType: NodeType) {
    // Create node at center of canvas when clicked
    dispatch('nodeCreate', {
      type: nodeType,
      position: { x: 400, y: 300 }
    });
  }

  function getNodeColor(type: NodeType) {
    switch (type) {
      case 'process': return '#4CAF50';
      case 'decision': return '#FF9800';
      case 'input': return '#2196F3';
      case 'output': return '#9C27B0';
      default: return '#757575';
    }
  }

  function getNodeShape(type: NodeType) {
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
</script>

<div class="node-palette">
  <h3>Node Types</h3>
  <div class="palette-grid">
    {#each nodeTypes as { type, label, icon }}
      <div
        class="palette-item"
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, type)}
        on:click={() => handleClick(type)}
        on:keydown={(e) => e.key === 'Enter' && handleClick(type)}
        style="
          background-color: {getNodeColor(type)};
          clip-path: {getNodeShape(type)};
        "
        role="button"
        tabindex="0"
        aria-label="Create {label} node"
      >
        <div class="palette-content">
          <span class="palette-icon">{icon}</span>
          <span class="palette-label">{label}</span>
        </div>
      </div>
    {/each}
  </div>
  <div class="palette-instructions">
    <p>Drag or click to add nodes</p>
  </div>
</div>

<style>
  .node-palette {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    min-width: 180px;
  }

  .node-palette h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #334155;
    font-weight: 600;
  }

  .palette-grid {
    display: grid;
    gap: 12px;
    margin-bottom: 16px;
  }

  .palette-item {
    width: 140px;
    height: 50px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    user-select: none;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .palette-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    opacity: 0.9;
    z-index: -1;
  }

  .palette-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .palette-item:active {
    cursor: grabbing;
    transform: translateY(0);
  }

  .palette-content {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: center;
    z-index: 1;
  }

  .palette-icon {
    font-size: 16px;
  }

  .palette-label {
    font-size: 13px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .palette-instructions {
    text-align: center;
    color: #64748b;
    font-size: 11px;
  }

  .palette-instructions p {
    margin: 0;
  }
</style>
