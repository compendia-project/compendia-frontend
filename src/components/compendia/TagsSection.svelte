<script>
  import { onMount, afterUpdate } from 'svelte';
  
  export let queries = [];
  export let handleSearch;
  export let title = "Queries";
  export let colorScheme = "green"; // "green" or "blue"
  
  let showMore = false;
  let tagsContainer;
  let shouldShowMoreButton = false;
  let visibleTagsCount = queries.length;
  let measurementComplete = false;

  function toggle() {
    showMore = !showMore;
  }

  // Color scheme configurations
  const colorSchemes = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      hoverBg: "hover:bg-green-100",
      border: "border-green-200/80",
      darkBg: "dark:bg-green-900/30",
      darkText: "dark:text-green-300",
      darkBorder: "dark:border-green-700/80",
      darkHoverBg: "dark:hover:bg-green-800/40",
      darkHoverText: "dark:hover:text-green-200",
      focusRing: "focus:ring-green-400/50",
      darkFocusRing: "dark:focus:ring-green-500/50"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      hoverBg: "hover:bg-blue-100",
      border: "border-blue-200/80",
      darkBg: "dark:bg-blue-900/30",
      darkText: "dark:text-blue-300",
      darkBorder: "dark:border-blue-700/80",
      darkHoverBg: "dark:hover:bg-blue-800/40",
      darkHoverText: "dark:hover:text-blue-200",
      focusRing: "focus:ring-blue-400/50",
      darkFocusRing: "dark:focus:ring-blue-500/50"
    }
  };

  function calculateVisibleTags() {
    if (!tagsContainer || queries.length === 0) return;
    
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      const tags = tagsContainer.children;
      if (tags.length === 0) return;
      
      // Get the first tag's position to determine the baseline
      const firstTagTop = tags[0].offsetTop;
      let count = 0;
      
      // Count tags that are on the same line as the first tag
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].offsetTop === firstTagTop) {
          count++;
        } else {
          break;
        }
      }
      
      // Ensure we show at least one tag
      count = Math.max(1, count);
      
      // If all tags fit on one line, show all
      if (count === queries.length) {
        visibleTagsCount = queries.length;
        shouldShowMoreButton = false;
      } else {
        // Show only tags that fit on the first line
        visibleTagsCount = count;
        shouldShowMoreButton = true;
      }
      
      measurementComplete = true;
    });
  }

  onMount(() => {
    // Reset measurement state when component mounts
    measurementComplete = false;
    visibleTagsCount = queries.length;
    calculateVisibleTags();
  });

  afterUpdate(() => {
    if (!showMore && !measurementComplete) {
      calculateVisibleTags();
    }
  });

  $: colors = colorSchemes[colorScheme] || colorSchemes.green;
  $: displayedQueries = showMore || !measurementComplete ? queries : queries.slice(0, visibleTagsCount);
  
  // Reset measurement when queries change
  $: if (queries) {
    measurementComplete = false;
    visibleTagsCount = queries.length;
    if (tagsContainer) {
      calculateVisibleTags();
    }
  }
</script>

<fieldset class="border text-[14px] border-gray-300 dark:border-gray-600 rounded-lg p-4 w-full">
  <legend class="text-[14px] text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">{title}</legend>
  
  <!-- Tags container -->
  <div class="flex gap-3 flex-wrap justify-center py-2" bind:this={tagsContainer}>
    {#each displayedQueries as query}
      <div
        class="{colors.bg} {colors.text} px-3 py-1 rounded-full text-[14px] cursor-pointer
               transition-all duration-200 {colors.hoverBg} hover:-translate-y-0.5
               active:translate-y-0 border {colors.border}
               {colors.darkBg} {colors.darkText} {colors.darkBorder}
               {colors.darkHoverBg} {colors.darkHoverText}
               focus:outline-none focus:ring-2 {colors.focusRing}
               {colors.darkFocusRing}"
        role="button"
        tabindex="0"
        on:click={() => handleSearch(query)}
      >
        {query.query}
      </div>
    {/each}
  </div>
  
  <!-- Show More/Less Button -->
  {#if shouldShowMoreButton}
    <div class="flex justify-center pt-2">
      <div
        on:click={toggle}
        class="flex items-center gap-1 text-[14px] text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer border-none bg-transparent p-0"
        role="button"
        tabindex="0"
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            toggle();
          }
        }}
      >
        {showMore ? "Show Less" : "Show More"}
        <svg
          class="w-3 h-3 transition-transform duration-200 {showMore ? 'rotate-180' : ''}"
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
  {/if}
</fieldset>