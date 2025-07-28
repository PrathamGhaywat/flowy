<script lang="ts">
  import FlowchartCanvas from './lib/FlowchartCanvas.svelte';
  import NodePalette from './lib/NodePalette.svelte';
  import Toolbar from './lib/Toolbar.svelte';
  import { flowchartData, gridSettings, canvasState } from './lib/stores';
  import { generateId, snapToGrid } from './lib/utils';
  import type { NodeType, FlowchartNode } from './lib/types';

  function handleNodeCreate(event: CustomEvent<{ type: NodeType; position: { x: number; y: number } }>) {
    const { type, position } = event.detail;
    
    const nodeSize = {
      width: type === 'decision' ? 120 : 100,
      height: type === 'decision' ? 80 : 60
    };

    const snappedPosition = snapToGrid(position, $gridSettings);

    const newNode: FlowchartNode = {
      id: generateId(),
      type,
      position: snappedPosition,
      size: nodeSize,
      text: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      selected: false
    };

    flowchartData.update(data => ({
      ...data,
      nodes: [...data.nodes, newNode]
    }));
  }

  function handleClear() {
    flowchartData.set({ nodes: [], connections: [] });
  }

  function handleToggleGrid() {
    gridSettings.update(settings => ({
      ...settings,
      enabled: !settings.enabled
    }));
  }

  function handleZoomIn() {
    canvasState.update(state => ({
      ...state,
      zoom: Math.min(3, state.zoom * 1.2)
    }));
  }

  function handleZoomOut() {
    canvasState.update(state => ({
      ...state,
      zoom: Math.max(0.1, state.zoom / 1.2)
    }));
  }

  function handleResetView() {
    canvasState.update(state => ({
      ...state,
      zoom: 1,
      pan: { x: 0, y: 0 }
    }));
  }
</script>

<main class="app">
  <header class="app-header">
    <h1>🌊 Flowy - Interactive Flowchart Designer</h1>
    <p>Create beautiful flowcharts with drag & drop functionality</p>
  </header>

  <div class="app-content">
    <aside class="sidebar left">
      <NodePalette on:nodeCreate={handleNodeCreate} />
    </aside>

    <div class="canvas-container">
      <FlowchartCanvas />
    </div>

    <aside class="sidebar right">
      <Toolbar 
        on:clear={handleClear}
        on:toggleGrid={handleToggleGrid}
        on:zoomIn={handleZoomIn}
        on:zoomOut={handleZoomOut}
        on:resetView={handleResetView}
      />
    </aside>
  </div>
</main>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f0f0f0;
  }

  .app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .app-header h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
  }

  .app-header p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  .app-content {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    min-height: 0;
  }

  .sidebar {
    flex-shrink: 0;
  }

  .sidebar.left {
    order: 1;
  }

  .sidebar.right {
    order: 3;
  }

  .canvas-container {
    flex: 1;
    order: 2;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    min-height: 0;
  }

  @media (max-width: 768px) {
    .app-content {
      flex-direction: column;
      gap: 12px;
    }

    .sidebar {
      order: initial;
    }

    .canvas-container {
      min-height: 400px;
    }
  }
</style>
