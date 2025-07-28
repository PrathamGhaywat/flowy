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
    canvasState.update(state => {
      const newZoom = Math.min(3, state.zoom * 1.2);
      return {
        ...state,
        zoom: newZoom
      };
    });
  }

  function handleZoomOut() {
    canvasState.update(state => {
      const newZoom = Math.max(0.1, state.zoom / 1.2);
      return {
        ...state,
        zoom: newZoom
      };
    });
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
    background: #ffffff;
  }

  .app-header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
    padding: 12px 20px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .app-header h1 {
    margin: 0 0 4px 0;
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
  }

  .app-header p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  .app-content {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    min-height: 0;
    background: #f9fafb;
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
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    min-height: 0;
    border: 1px solid #e5e7eb;
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

    .app-header {
      padding: 12px 16px;
    }

    .app-header h1 {
      font-size: 20px;
    }
  }
</style>
