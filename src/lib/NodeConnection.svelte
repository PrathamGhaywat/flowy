<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Connection } from '../lib/types';

  export let connection: Connection;
  
  const dispatch = createEventDispatcher<{
    connectionDelete: { id: string };
  }>();

  function handleConnectionClick(event: MouseEvent) {
    if (event.detail === 2) { // Double click
      dispatch('connectionDelete', { id: connection.id });
    }
  }

  function createArrowPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return '';
    
    // Control points for curved line
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
    const cp1x = from.x + controlOffset;
    const cp1y = from.y;
    const cp2x = to.x - controlOffset;
    const cp2y = to.y;
    
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  }

  $: pathData = createArrowPath(connection.fromPoint, connection.toPoint);
</script>

<g 
  class="connection" 
  on:click={handleConnectionClick}
  on:keydown={(e) => e.key === 'Enter' && handleConnectionClick(e)}
  role="button"
  aria-label="Connection between nodes"
  tabindex="0"
>
  <!-- Connection line -->
  <path
    d={pathData}
    stroke="#6b7280"
    stroke-width="2"
    fill="none"
    class="connection-path"
    marker-end="url(#arrowhead)"
  />
  
  <!-- Invisible wider path for easier clicking -->
  <path
    d={pathData}
    stroke="transparent"
    stroke-width="12"
    fill="none"
    class="connection-hitbox"
  />
  
  <!-- Arrow marker definition -->
  <defs>
    <marker
      id="arrowhead"
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon
        points="0 0, 10 3.5, 0 7"
        fill="#6b7280"
      />
    </marker>
  </defs>
</g>

<style>
  .connection {
    cursor: pointer;
  }

  .connection-path {
    transition: all 0.2s ease;
  }

  .connection:hover .connection-path {
    stroke: #3b82f6;
    stroke-width: 3;
  }

  .connection:hover marker polygon {
    fill: #3b82f6;
  }

  .connection-hitbox {
    pointer-events: all;
  }
</style>
