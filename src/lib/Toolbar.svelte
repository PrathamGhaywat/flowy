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
    </div>
  </div>
</div>

<style>
  .toolbar {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 200px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .toolbar-section h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  button {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  button:hover {
    background: #f5f5f5;
    border-color: #007ACC;
  }

  button.active {
    background: #007ACC;
    color: white;
    border-color: #007ACC;
  }

  button.danger {
    color: #d32f2f;
  }

  button.danger:hover {
    background: #ffebee;
    border-color: #d32f2f;
  }

  .grid-size-slider {
    width: 100%;
    margin-top: 4px;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .stat-label {
    color: #666;
  }

  .stat-value {
    font-weight: 500;
    color: #333;
  }
</style>
