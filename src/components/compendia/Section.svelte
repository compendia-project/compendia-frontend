<script>
  import ScrollSection from "$components/compendia/ScrollSection.svelte";
  export let stepHandler;
  export let viewportHeight;
  export let viewportWidth;
  export let clusterData;
</script>

<ScrollSection {viewportHeight} {viewportWidth} {stepHandler} {clusterData} />
