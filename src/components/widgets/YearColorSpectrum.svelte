<script>
  import * as d3 from "d3";
  import { theme } from "$stores/store.js";

  export let years;
  export let yearColors = [];
  export let stats = {};
  export let articles;
  export let currentArticles;
  export let currentFacts;
  export let filteredYearArticleCount;

  let totalArticles = stats.total_articles;
  let totalFacts = stats.total_original_facts;
  let showMoreFilters = true;

  const darkThemeColors = ["#D0E1F9d1", "#B0E0E6d1", "#4682B4d1", "#75a2f8d1"];
  const lightThemeColors = ["#D0E1F9d1", "#B0E0E6d1", "#74b8f0d1", "#8ba2f0"];

  $: {
    if (years && years.earliest && years.latest && articles) {
      const articleCount = getYearArticleCount(articles);
      yearColors = [];
      const widthScale = d3
        .scaleLinear()
        .domain([0, totalArticles])
        .range([0, 50]);

      const colorScale = d3
        .scaleSequential()
        .domain([parseInt(years.earliest), parseInt(years.latest)]);

      if ($theme === "dark") {
        colorScale.interpolator(d3.interpolateRgbBasis(darkThemeColors));
      } else {
        colorScale.interpolator(d3.interpolateRgbBasis(lightThemeColors));
      }

      yearColors.push({
        year: "Unknown",
        color: "#c6bea9bf",
        count: articleCount["Unknown"] || 0,
        width: widthScale(filteredYearArticleCount["Unknown"] || 0),
        currentCount: filteredYearArticleCount["Unknown"] || 0,
      });

      for (let year = years.earliest; year <= years.latest; year++) {
        yearColors.push({
          year,
          color: colorScale(year),
          count: articleCount[year] || 0,
          width: widthScale(filteredYearArticleCount[year] || 0),
          currentCount: filteredYearArticleCount[year] || 0,
        });
      }
    }
  }

  function getYearArticleCount(articles) {
    const yearCounts = {};

    articles.forEach((article) => {
      const year = article.year === "Unknown" ? "Unknown" : article.year;
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    return yearCounts;
  }

  function toggleFilters() {
    showMoreFilters = !showMoreFilters;
  }
</script>

<div
  class="absolute bottom-[10px] left-[10px] bg-white dark:bg-[#1b2d3d] shadow-lg rounded-lg p-2 pl-4 pr-4"
>
  <div class="mt-1 text-[11px]">
    <p
      class="mb-1 text-[#6b717b] font-semibold dark:text-[rgba(255,255,255,0.6)] flex justify-between"
    >
      Articles Shown: <span
        class="font-bold text-[var(--color-progress-arc-article-text)] dark:text-[var(--color-progress-arc-article-text-dark)] pl-4"
        >{currentArticles}/{totalArticles}</span
      >
    </p>
    <p
      class="m-0 text-[#6b717b] font-semibold dark:text-[rgba(255,255,255,0.6)] flex justify-between"
    >
      Facts Shown: <span
        class="font-bold text-[var(--color-progress-arc-fact-text)] dark:text-[var(--color-progress-arc-fact-text-dark)]"
        >{currentFacts}/{totalFacts}</span
      >
    </p>

    {#if showMoreFilters}
    <div class="pt-[10px]">
      <hr class="styled-hr" />
    </div>

    <div
      class="mt-3 pb-2 text-[#6b717b] font-semibold dark:text-[rgba(255,255,255,0.6)]"
    >
      Published Years
    </div>
    {#if yearColors.length > 0}
      <div class="years flex flex-col gap-1">
        {#each yearColors as yearColor}
          {#if yearColor.count !== 0}
            <div class="year-item flex items-center">
              <span
                class="text-gray-500 dark:text-[rgba(255,255,255,0.6)] w-16 text-right"
                >{yearColor.year}</span
              >
              <div
                class="color-box ml-1 h-4"
                style="background-color: {yearColor.color}; width: {yearColor.width}px"
              ></div>
              <span style="color:{yearColor.color} ;"
                >{yearColor.currentCount}/{yearColor.count}</span
              >
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <p>Loading year data...</p>
    {/if}
    {/if}
  </div>

  <!-- Show more/less filters button -->
  <!-- <div class="flex justify-center pt-[10px]">
    <div
      on:click={toggleFilters}
      class="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer border-none bg-transparent p-0"
    >
      {showMoreFilters ? "Show Less" : "Show More"}
      <svg
        class="w-3 h-3 transition-transform duration-200 {showMoreFilters
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div> -->
</div>

<style>
  .year-spectrum {
    position: absolute;
    top: 10px;
    /* right: 200px; */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* font-family: Arial, sans-serif; */
  }

  .years {
    display: flex;
    flex-direction: column-reverse;
  }

  .year-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .color-box {
    width: 15px;
    height: 15px;
    margin-right: 5px;
  }

  .year-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
  }

  .year-title {
    font-weight: 600;
    margin-bottom: 5px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .styled-hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #c2c2c2, transparent);
  }

  :global(.dark) .styled-hr {
    background: linear-gradient(to right, transparent, #374151, transparent);
  }
</style>
