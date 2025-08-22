<script>
  export let searchQuery = "";
  export let isLoading = false;
  export let onSearch;
  export let onOptionsClick;

  let showOptionsPopup = false;
  export let showRecentStories = false;
  export let showSampleStories = false;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(e);
    }
  };
  
  const toggleOptionsPopup = () => {
    showOptionsPopup = !showOptionsPopup;
    if (onOptionsClick) {
      onOptionsClick();
    }
  };

  const toggleRecentStories = () => {
    showRecentStories = !showRecentStories;
  };

  const autoResize = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const toggleSampleStories = () => {
    showSampleStories = !showSampleStories;
  };
</script>

<form on:submit={handleSubmit} class="w-full max-w-3xl mx-auto">
  <!-- Main search area with controls inside -->
  <div class="w-full rounded-3xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg transition-all duration-150 ease-in-out hover:border-gray-300 dark:hover:border-gray-500">
      <!-- Textarea -->
      <div class="p-4">
        <textarea
          bind:value={searchQuery}
          placeholder="Search on Compendia..."
          class="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 text-base font-normal resize-none placeholder-gray-500 dark:placeholder-gray-400 min-h-[50px] leading-relaxed focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0"
          rows="2"
          on:input={autoResize}
        ></textarea>
      </div>
      
      <!-- Bottom controls inside the wrapper -->
      <div class="flex justify-between items-center px-4 pb-4">
        <!-- Left side controls -->
         <div class="flex items-center gap-2">
           <!-- Options button -->
           <div class="relative">
             <button type="button" class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-100 ease-in-out" aria-label="Options" on:click={toggleOptionsPopup}>
               <svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
                 <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-1 13.5l103 78-110 190-119-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 41q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 65q-5 14-7 29.5t-2 31.5q0 16 2 31.5t7 29.5l-86 65 39 68 99-41q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
               </svg>
             </button>
           </div>
          
          <!-- Recent Stories button -->
          <div class="relative">
            <button type="button" class="h-8 px-3 flex items-center justify-center gap-1 {showRecentStories ? 'bg-green-50 dark:bg-green-900/30 border-green-200/80 dark:border-green-700/80 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300'} border rounded-2xl {showRecentStories ? 'hover:bg-green-100 dark:hover:bg-green-800/40 hover:border-green-300 dark:hover:border-green-600 hover:text-green-800 dark:hover:text-green-200' : 'hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-100'} transition-all duration-100 ease-in-out text-sm font-medium" on:click={toggleRecentStories} aria-label="Recent stories">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span class="hidden md:block">Recent</span>
            </button>
            <!-- {#if showRecentStories}
              <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 min-w-48 overflow-hidden">
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Data Analysis Report - Q4 2023</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Customer Behavior Study</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Market Trends Analysis</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Product Performance Review</div>
              </div>
            {/if} -->
          </div>
          
          <!-- Sample Stories button -->
          <div class="relative">
            <button type="button" class="h-8 px-3 flex items-center justify-center gap-1 {showSampleStories ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200/80 dark:border-blue-700/80 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300'} border rounded-2xl {showSampleStories ? 'hover:bg-blue-100 dark:hover:bg-blue-800/40 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-800 dark:hover:text-blue-200' : 'hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-100'} transition-all duration-100 ease-in-out text-sm font-medium" on:click={toggleSampleStories} aria-label="Sample stories">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <span class="hidden md:block">Samples</span>
            </button>
            <!-- {#if showSampleStories}
              <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 min-w-48 overflow-hidden">
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Getting Started with Data Visualization</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Basic Chart Types Tutorial</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">Interactive Dashboard Example</div>
                <div class="p-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Statistical Analysis Template</div>
              </div>
            {/if} -->
          </div>
          
        </div>
        
        <!-- Right side submit button -->
        <button type="submit" class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-100 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
          {#if isLoading}
            <div class="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12V4M4 8L8 4L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </button>
      </div>
    </div>
</form>

<style>
  /* Custom styles for specific functionality not covered by Tailwind */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Remove all focus styling from textarea */
  textarea {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  textarea:focus,
  textarea:focus-visible,
  textarea:focus-within {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    ring: none !important;
  }
</style>