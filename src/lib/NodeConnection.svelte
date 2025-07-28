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

  function getArrowMarker(from: { x: number; y: number }, to: { x: number; y: number }) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
    return {
      x: to.x,
      y: to.y,
      angle
    };
  }

  $: pathData = createArrowPath(connection.fromPoint, connection.toPoint);
  $: arrow = getArrowMarker(connection.fromPoint, connection.toPoint);
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
    stroke="#333"
    stroke-width="2"
    fill="none"
    class="connection-path"
  />
  
  <!-- Arrow head -->
  <polygon
    points="-8,-4 -8,4 0,0"
    fill="#333"
    transform="translate({arrow.x},{arrow.y}) rotate({arrow.angle})"
    class="arrow-head"
  />
  
  <!-- Invisible wider path for easier clicking -->
  <path
    d={pathData}
    stroke="transparent"
    stroke-width="10"
    fill="none"
    class="connection-hitbox"
  />
</g>

<style>
  .connection {
    cursor: pointer;
  }

  .connection-path {
    transition: stroke 0.2s ease;
  }

  .connection:hover .connection-path {
    stroke: #007ACC;
    stroke-width: 3;
  }

  .connection:hover .arrow-head {
    fill: #007ACC;
  }

  .connection-hitbox {
    pointer-events: all;
  }
</style>
