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
      case 'process': return '#fef3c7'; // Light yellow
      case 'decision': return '#fed7d7'; // Light red/pink
      case 'input': return '#dbeafe'; // Light blue
      case 'output': return '#d1fae5'; // Light green
      default: return '#f3f4f6';
    }
  }

  function getNodeBorderColor(type: NodeType) {
    switch (type) {
      case 'process': return '#f59e0b'; // Yellow
      case 'decision': return '#ef4444'; // Red
      case 'input': return '#3b82f6'; // Blue
      case 'output': return '#10b981'; // Green
      default: return '#6b7280';
    }
  }

  function getNodeTextColor(type: NodeType) {
    switch (type) {
      case 'process': return '#92400e'; // Dark yellow
      case 'decision': return '#b91c1c'; // Dark red
      case 'input': return '#1e40af'; // Dark blue
      case 'output': return '#047857'; // Dark green
      default: return '#374151';
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
          border-color: {getNodeBorderColor(type)};
          color: {getNodeTextColor(type)};
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
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    min-width: 180px;
  }

  .node-palette h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #1f2937;
    font-weight: 700;
  }

  .palette-grid {
    display: grid;
    gap: 12px;
    margin-bottom: 16px;
  }

  .palette-item {
    width: 140px;
    height: 50px;
    border: 2px solid;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: relative;
    overflow: hidden;
    font-weight: 600;
  }

  .palette-item:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
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
    font-weight: 600;
  }

  .palette-instructions {
    text-align: center;
    color: #6b7280;
    font-size: 11px;
  }

  .palette-instructions p {
    margin: 0;
  }
</style>
