<script>
  export let cluster;
  export let radius;

  let textLength = cluster?.title.length || 0;
  let rectWidth = textLength * 7.5 + 30;
</script>

{#if radius && cluster}
  <rect
    x={-rectWidth / 2}
    y={-radius - 70}
    width={rectWidth}
    height="40"
    rx="15"
    ry="15"
    class="fill-[var(--cluster-title-bg)] dark:fill-[var(--cluster-title-bg-dark)]"
  />

  <text
    x={0}
    y={-radius - 45}
    text-anchor="middle"
    class="fill-[var(--cluster-title-text)] dark:fill-[var(--cluster-title-text-dark)]"
  >
    {cluster.title}
  </text>
{/if}

<style>
  rect {
    transition: all 0.3s ease-in-out;
  }

  text {
    /* font-family: Arial, sans-serif; */
    font-size: 16px;
    font-weight: 500;
  }
</style>
