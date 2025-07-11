<script>
  import { createEventDispatcher } from "svelte";
  import CustomSlider from "$components/helpers/CustomSlider.svelte";
  import CustomRangeSlider from "$components/helpers/CustomRangeSlider.svelte";

  export let maxTopics = 12;
  export let currentTopics = 6;
  export let startTopics = 2;
  export let shared_articles = [];
  export let connectedArticlesLimit = [0, 1];
  export let showFactCircles = true;

  const dispatch = createEventDispatcher();
  let showMoreFilters = false;

  // Shared articles calculations
  $: maxLimit =
    shared_articles.length > 0
      ? Math.max(...shared_articles.map((article) => article.count))
      : 5;

  // Dispatch changes when currentTopics changes
  $: if (currentTopics !== undefined) {
    dispatch("relevanceChange", { value: currentTopics });
  }

  // Dispatch changes when connectedArticlesLimit changes
  $: if (connectedArticlesLimit !== undefined) {
    dispatch("limitChange", { limit: connectedArticlesLimit });
  }

  // Dispatch changes when showFactCircles changes
  $: if (showFactCircles !== undefined) {
    dispatch("factsChange", { showFactCircles });
  }

  function handleTopicsChange(event) {
    currentTopics = event.detail.value;
    dispatch("relevanceChange", { value: currentTopics });
  }

  function handleLimitChange(event) {
    connectedArticlesLimit = event.detail.value;
    dispatch("limitChange", { limit: connectedArticlesLimit });
  }

  // Add function to toggle filters visibility
  function toggleFilters() {
    showMoreFilters = !showMoreFilters;
  }
</script>

<div class="mb-2">
  <CustomSlider
    bind:value={currentTopics}
    min={startTopics}
    max={maxTopics}
    step={1}
    tickStep={1}
    tickValueStep={2}
    label="Number of Topics"
    leftLabel="Most Relevant"
    rightLabel="Least Relevant"
    on:change={handleTopicsChange}
    tooltipText="Filter topics based on their relevance order. Less number of topics means more relevant topics to your query."
  />
</div>

<!-- Additional filters - only show when showMoreFilters is true -->
{#if showMoreFilters}
  <div class="pt-[10px] pb-[10px] ml-[-30px] mr-[-30px]">
    <hr class="styled-hr" />
  </div>

  <div class="mb-4">
    <CustomRangeSlider
      bind:value={connectedArticlesLimit}
      min={0}
      max={maxLimit}
      step={1}
      label="Number of Shared Articles"
      leftLabel="Weaker Connections"
      rightLabel="Stronger Connections"
      tooltipText="Filter connections (links) based on the number of shared articles."
    />
  </div>

  <div class="pt-[10px] pb-[10px] ml-[-30px] mr-[-30px]">
    <hr class="styled-hr" />
  </div>

  <div class="ml-[-30px]">
    <div class="flex items-center">
      <div class="flex items-center gap-1">
        <label class="text-[11px] font-bold text-gray-600 dark:text-gray-300"
          >Show Facts</label
        >
        <!-- <div class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" use:factsTooltip>
            <Info size={14} />
          </div> -->
      </div>
      <label class="inline-flex items-center cursor-pointer ml-[10px]">
        <input
          type="checkbox"
          bind:checked={showFactCircles}
          class="sr-only peer"
        />
        <div
          class="relative w-7 h-4 bg-[#dee8ff] dark:bg-[#374151] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-[#79a1fc] dark:peer-checked:bg-[#6366f1]"
        ></div>
      </label>
    </div>
  </div>
{/if}

<!-- Show more/less filters button -->
<div class="flex justify-center pt-[10px]">
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
</div>

<style>
  /* Styled HR separator */
  .styled-hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #c2c2c2, transparent);
  }

  :global(.dark) .styled-hr {
    background: linear-gradient(to right, transparent, #374151, transparent);
  }
</style>
