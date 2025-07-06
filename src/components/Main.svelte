<script>
  import Compendia from "$components/compendia/Compendia.svelte";
  import viewport from "$stores/viewport.js";
  import { onMount } from "svelte";
  import ColorTheme from "$components/compendia/ColorTheme.svelte";

  let viewportHeight;
  let viewportWidth;
  let mounted;

  onMount(() => {
    viewportHeight = $viewport.height;
    viewportWidth = $viewport.width;
    mounted = true;
  });
</script>

{#if mounted}
  <Compendia {viewportHeight} {viewportWidth} />
  <ColorTheme></ColorTheme>
{/if}
