<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { flowchartData, gridSettings, canvasState } from '../lib/stores';
  import { exportToJSON, downloadFile } from '../lib/utils';
  import html2canvas from 'html2canvas';

  const dispatch = createEventDispatcher<{
    clear: void;
    toggleGrid: void;
    zoomIn: void;
    zoomOut: void;
    resetView: void;
  }>();

  async function exportAsImage() {
    const canvas = document.querySelector('.flowchart-canvas') as HTMLElement;
    if (!canvas) return;

    try {
      const canvasElement = await html2canvas(canvas, {
        backgroundColor: '#f5f5f5',
        scale: 2,
        useCORS: true
      });
      
      canvasElement.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'flowchart.png';
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  function exportAsJSON() {
    flowchartData.subscribe(data => {
      const jsonData = exportToJSON(data);
      downloadFile(jsonData, 'flowchart.json', 'application/json');
    })();
  }

  function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.nodes && data.connections) {
              flowchartData.set(data);
            } else {
              alert('Invalid JSON format. Expected nodes and connections arrays.');
            }
          } catch (error) {
            alert('Error parsing JSON file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  function handleClear() {
    if (confirm('Clear all nodes and connections?')) {
      dispatch('clear');
    }
  }
</script>

<div class="toolbar">
  <div class="toolbar-section">
    <h3>Canvas</h3>
    <div class="button-group">
      <button on:click={() => dispatch('zoomIn')} title="Zoom In">
        🔍+
      </button>
      <button on:click={() => dispatch('zoomOut')} title="Zoom Out">
        🔍-
      </button>
      <button on:click={() => dispatch('resetView')} title="Reset View">
        🏠
      </button>
    </div>
  </div>

  <div class="toolbar-section">
    <h3>Grid</h3>
    <div class="button-group">
      <button 
        on:click={() => dispatch('toggleGrid')}
        class:active={$gridSettings.enabled}
        title="Toggle Grid"
      >
        📏
      </button>
      <input
        type="range"
        min="10"
        max="50"
        bind:value={$gridSettings.size}
        title="Grid Size"
        class="grid-size-slider"
      />
    </div>
  </div>

  <div class="toolbar-section">
    <h3>Export</h3>
    <div class="button-group">
      <button on:click={exportAsImage} title="Export as PNG">
        🖼️ PNG
      </button>
      <button on:click={exportAsJSON} title="Export as JSON">
        📄 JSON
      </button>
    </div>
  </div>

  <div class="toolbar-section">
    <h3>File</h3>
    <div class="button-group">
      <button on:click={importFromJSON} title="Import JSON">
        📂 Import
      </button>
      <button on:click={handleClear} title="Clear All" class="danger">
        🗑️ Clear
      </button>
    </div>
  </div>

  <div class="toolbar-section">
    <h3>Info</h3>
    <div class="stats">
      <div class="stat">
        <span class="stat-label">Nodes:</span>
        <span class="stat-value">{$flowchartData.nodes.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Connections:</span>
        <span class="stat-value">{$flowchartData.connections.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Zoom:</span>
        <span class="stat-value">{Math.round($canvasState.zoom * 100)}%</span>
      </div>
      <div class="stat">
        <span class="stat-label">Selected:</span>
        <span class="stat-value">{$canvasState.selection.length}</span>
      </div>
    </div>
  </div>

  <div class="toolbar-section">
    <h3>Shortcuts</h3>
    <div class="shortcuts">
      <div class="shortcut">
        <span class="shortcut-key">Delete</span>
        <span class="shortcut-desc">Remove selected</span>
      </div>
      <div class="shortcut">
        <span class="shortcut-key">Ctrl+Click</span>
        <span class="shortcut-desc">Multi-select</span>
      </div>
      <div class="shortcut">
        <span class="shortcut-key">Double-click</span>
        <span class="shortcut-desc">Edit text</span>
      </div>
    </div>
  </div>
</div>

<style>
  .toolbar {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 180px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .toolbar-section h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #334155;
    font-weight: 600;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 6px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  button {
    padding: 8px 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    backdrop-filter: blur(5px);
    font-weight: 500;
  }

  button:hover {
    background: rgba(255, 255, 255, 1);
    border-color: #007ACC;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  button.active {
    background: #007ACC;
    color: white;
    border-color: #007ACC;
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
  }

  button.danger {
    color: #dc2626;
  }

  button.danger:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #dc2626;
  }

  .grid-size-slider {
    width: 100%;
    margin-top: 6px;
    accent-color: #007ACC;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 4px 0;
  }

  .stat-label {
    color: #64748b;
    font-weight: 500;
  }

  .stat-value {
    font-weight: 600;
    color: #334155;
  }

  .shortcuts {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .shortcut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    padding: 2px 0;
  }

  .shortcut-key {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    color: #334155;
    font-family: monospace;
    font-size: 10px;
  }

  .shortcut-desc {
    color: #64748b;
    font-weight: 500;
  }
</style>
