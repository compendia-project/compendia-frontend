<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { theme } from "$stores/store.js";
  export let inputData = [];

  let dataUnits = [];
  let totalUnits = 100;
  let unitsPerRow = 10;
  let unitSize = 20;
  let unitSpacing = 3;

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getThemeColor(lightColor, darkColor) {
    return $theme === "dark" ? darkColor : lightColor;
  }

  onMount(() => {
    dataUnits = d3.range(totalUnits).map((d) => ({ id: d + 1 }));
    let cumulative = 0;

    inputData.forEach((d) => {
      const percentage = parseFloat(d.value.match(/\d+(\.\d+)?/g)[0]);
      const unitsCount = Math.round((percentage / 100) * totalUnits);

      for (let i = cumulative; i < cumulative + unitsCount; i++) {
        if (i < totalUnits) {
          dataUnits[i].color = hexToRgba(
            d.color || "#EB3678",
            $theme === "dark" ? 0.82 : 0.7
          );
          dataUnits[i].label = `${d.label} (${d.value})`;
        }
      }
      cumulative += unitsCount;
    });

    for (let i = cumulative; i < totalUnits; i++) {
      dataUnits[i].color = getThemeColor(
        hexToRgba("#d3d5d8", 0.9),
        hexToRgba("#d3d5d8", 0.6)
      );
      dataUnits[i].label = "Other";
    }
  });
</script>

<svg
  width={unitsPerRow * (unitSize + unitSpacing)}
  height={Math.ceil(totalUnits / unitsPerRow) * (unitSize + unitSpacing) + 50}
>
  {#each dataUnits as d, i}
    <circle
      cx={(i % unitsPerRow) * (unitSize + unitSpacing) + unitSize / 2}
      cy={Math.floor(i / unitsPerRow) * (unitSize + unitSpacing) + unitSize / 2}
      r={unitSize / 2 - unitSpacing}
      fill={d.color}
    />
  {/each}

  <g
    transform={`translate(10, ${
      Math.ceil(totalUnits / unitsPerRow) * (unitSize + unitSpacing) + 20
    })`}
  >
    {#each inputData as d, i}
      <g transform={`translate(10, ${i * 25})`}>
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={hexToRgba(d.color || "#EB3678", $theme === "dark" ? 0.82 : 0.7)}
        ></circle>
        <text
          x="20"
          y="2"
          class="fill-black dark:fill-white"
          style="font-size: 12px;"
          alignment-baseline="middle"
        >
          {d.label}
        </text>
      </g>
    {/each}
  </g>
</svg>
