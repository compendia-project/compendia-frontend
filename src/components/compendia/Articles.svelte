<script>
  let isOpen = false;

  export let articles;
  export let yearColors;

  const togglePanel = () => {
    isOpen = !isOpen;
  };

  function getColor(year) {
    let found = yearColors.find((entry) => entry.year == year);
    return found ? found.color : "#c6bea9bf";
  }
</script>

{#if !isOpen}
  <!-- Open Button -->
  <div class="fixed bottom-4 right-4 z-4 transform -translate-y-1/2">
    <button
      id="open-button"
      on:click={togglePanel}
      class="text-gray-900 dark:text-white text-1xl p-2 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 relative z-50"
    >
      ←
    </button>
  </div>
{:else}
  <div class="fixed bottom-4 z-[1006] right-4 transform -translate-y-1/2">
    <button
      id="close-button"
      on:click={togglePanel}
      class="text-gray-900 dark:text-white text-1xl p-2 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 relative z-50"
    >
      →
    </button>
  </div>
{/if}

{#if isOpen}
  <!-- Panel Content -->
  <div
    class="absolute right-0 bottom-5 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg p-4 rounded-xl shadow-md w-80 h-full overflow-y-auto z-10 border border-gray-200 dark:border-gray-700"
    style="width:300px; z-index:1004;"
  >
    {#each articles as article}
      <div
        class="bg-gray-100 dark:bg-white/20 p-3 rounded-lg shadow-sm mb-3 last:mb-0 backdrop-blur-md border border-gray-200 dark:border-gray-700"
      >
        <h3
          class="text-sm font-semibold mt-0 text-[#111827c2] dark:[#fffc] line-clamp-3"
        >
          {article.result_title}
        </h3>
        <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {article.meta_description}
        </p>
        <div class="flex items-center mt-2">
          <a href={article.url} target="_blank" style="color: transparent;">
            <img
              src={article.favicon}
              alt={article.source}
              class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"
            />
          </a>
          <a href={article.url} target="_blank" style="color: transparent;">
            <span
              class="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[140px] block"
            >
              {article.source}
            </span>
          </a>
          <span
            class="year-box ml-2 text-xs font-medium bg-[#e2e2e2c7] dark:bg-[#2d4050]"
            style="color:{getColor(article.year)};"
          >
            {article.year}
          </span>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .year-box {
    font-weight: bold;
    font-size: 0.85rem;
    margin-left: auto;
    padding: 2px 6px;
    border-radius: 4px;
    position: static;
  }
</style>
