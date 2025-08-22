<script>
  import Doughnut from "$components/charts/Doughnut.svelte";
  import Bar from "$components/charts/Bar.svelte";
  import Line from "$components/charts/Line.svelte";
  import Isotype from "$components/charts/Isotype.svelte";
  import Scatter from "$components/charts/Scatter.svelte";

  export let fact = {};
  export let articlesDict;

  // Reactive variables
  let titles = fact.titles || {};
  let chartTitle = titles.chart_title || "";
  let axisXTitle = titles.x_axis || "";
  let axisYTitle = titles.y_axis || "";
  let narrative = fact.narrative || "";
  let merged_articles =
    fact.merged_articles?.sort((a, b) => Number(a.id) - Number(b.id)) || [];

  // Visualization state
  let visRecommendation = "text";
  let visData = [];
  let dataValue = null;

  // Main reactive processing
  $: {
    const initialRecommendation =
      fact.vis_data?.length > 1 ? fact.vis_recommendation : "text";
    const processed = processVisualizationData(
      fact.vis_data || [],
      initialRecommendation
    );
    visRecommendation = processed.recommendation;
    visData = processed.filteredData;
    dataValue = visData[0] || {};
  }

  function processVisualizationData(rawData, recommendation) {
    let filteredData = [...rawData];
    let newRecommendation = recommendation;

    // Handle empty state
    if (filteredData.length === 0) {
      return { recommendation: "text", filteredData: [] };
    }

    // Single data point handling
    if (filteredData.length === 1) {
      const isPercentage =
        ["%", "percentage"].includes(filteredData[0]?.unit?.toLowerCase()) &&
        filteredData[0]?.value <= 100;

      const isIsotype = filteredData[0].type === "isotype" || isPercentage;
      return {
        recommendation: isIsotype ? "isotype" : "text",
        filteredData,
      };
    }

    // Pie chart validation
    if (newRecommendation === "pie") {
      const units = filteredData.map((d) => d.unit?.toLowerCase() || "");
      const uniqueUnits = [...new Set(units)];

      if (
        uniqueUnits.length !== 1 ||
        !["%", "percentage"].includes(uniqueUnits[0])
      ) {
        newRecommendation = "bar";
      } else {
        const total = filteredData.reduce((sum, item) => {
          const value = parseFloat(item.value) || 0;
          return sum + value;
        }, 0);

        if (Math.abs(total - 100) > 0.001) {
          // Allow for floating point precision
          newRecommendation = "bar";
        }
      }
    }

    // Bar chart unit consolidation
    if (newRecommendation === "bar") {
      const unitCounts = filteredData.reduce((acc, { unit }) => {
        const key = unit || "undefined";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      if (Object.keys(unitCounts).length > 1) {
        const maxCount = Math.max(...Object.values(unitCounts));

        // Get all units with max count
        const candidateUnits = Object.keys(unitCounts).filter(
          (unit) => unitCounts[unit] === maxCount
        );

        // Prioritization logic
        let majorityUnit;
        if (candidateUnits.length > 1) {
          // Check for percentage units first
          const percentageUnits = candidateUnits.filter((unit) =>
            ["%", "percentage"].includes(unit.toLowerCase())
          );

          majorityUnit =
            percentageUnits.length > 0
              ? percentageUnits[0] // Take first percentage unit
              : candidateUnits[0]; // Fallback to first candidate
        } else {
          majorityUnit = candidateUnits[0];
        }

        filteredData = filteredData.filter((d) => d.unit === majorityUnit);
      }
    }

    // Single data point handling
    if (filteredData.length === 1) {
      const isPercentage =
        ["%", "percentage"].includes(filteredData[0]?.unit?.toLowerCase()) &&
        filteredData[0]?.value <= 100;

      const isIsotype = filteredData[0].type === "isotype" || isPercentage;
      return {
        recommendation: isIsotype ? "isotype" : "text",
        filteredData,
      };
    }

    // Fallback to text if no valid data remains
    return {
      recommendation: filteredData.length > 0 ? newRecommendation : "text",
      filteredData,
    };
  }
</script>

<div
  class="relative block pointer-events-auto backdrop-blur-md w-full flex h-[400px] p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-sm dark:bg-[var(--card-bg-dark)] dark:border-slate-900"
>
  <div
    class="absolute -top-4 right-4 bg-[var(--card-title-bg)] dark:bg-[var(--card-title-bg-dark)] text-[var(--card-title-text)] dark:text-[var(--card-title-text)] font-bold text-[20px] px-3 py-1 rounded-lg max-w-[80%] truncate cursor-default"
  >
    {chartTitle}
  </div>

  <div class="flex items-center justify-center bottom-2 w-full">
    <div class="w-1/2">
      <div
        class="chart-wrapper flex items-center justify-center"
        style="width: 350px; height: 300px;"
      >
        {#if visRecommendation === "pie"}
          <Doughnut inputData={visData} />
        {:else if visRecommendation === "bar"}
          <Bar inputData={visData} {axisXTitle} {axisYTitle} />
        {:else if visRecommendation === "line"}
          <Line inputData={visData} {axisXTitle} {axisYTitle} />
        {:else if visRecommendation === "isotype"}
          <Isotype inputData={visData} />
        {:else if visRecommendation === "range"}
          <Scatter inputData={visData} {axisXTitle} {axisYTitle} />
        {:else}
          <div
            class="flex items-center justify-center w-full max-w-[300px] h-full"
          >
            {#if dataValue}
              <p
                class="text-center w-full font-bold break-words"
                style="font-size: calc(min(50vw, 50vh) * 0.1); color: {dataValue.color};"
              >
                {dataValue.value}
                {dataValue.unit}
              </p>
            {:else}
              <p class="text-gray-500">No data available</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div class="w-1/2 pl-4 cursor-default pt-4">
      <p
        class="text-[20px] text inline pb-3 text-[var(--card-narrative-text)] dark:text-[var(--card-narrative-text-dark)]"
      >
        {@html narrative}
      </p>
      {#each merged_articles as article}
        {#if articlesDict[article.id]}
          <a href={article.url} target="_blank" style="color: transparent;">
            <img
              src={articlesDict[article.id].favicon}
              alt={articlesDict[article.id].source}
              class="inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-[#f1f3f4] rounded-full mx-1"
            />
          </a>
        {/if}
      {/each}
    </div>
  </div>
</div>
