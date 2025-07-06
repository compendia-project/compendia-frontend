<script>
  import { Globe, FileText, Save, X } from "lucide-svelte";

  export let web = "";
  export let resultsCountPerPage = 4;
  export let handlePopupSubmit;
  export let togglePopup;
</script>

<div
  class="fixed inset-0 flex items-center justify-center bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm z-50"
>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-96 border border-slate-200/60 dark:border-slate-700/60"
  >
    <!-- Header Section -->
    <div
      class="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-medium text-slate-800 dark:text-slate-100">
          Search Options
        </h3>
        <button
          on:click={togglePopup}
          class="p-1 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 rounded-full transition-colors"
        >
          <X class="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </button>
      </div>
    </div>

    <!-- Content Section -->
    <div class="px-6 py-6 space-y-6">
      <!-- Website Field -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <Globe class="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
            >Websites</label
          >
        </div>
        <input
          type="text"
          bind:value={web}
          placeholder="pewresearch.org; example.com"
          class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300/40 dark:focus:ring-slate-500/40 focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Separate multiple websites with semicolons
        </p>
      </div>

      <!-- Result Count Field -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <FileText class="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
            >Results Count</label
          >
        </div>
        <input
          type="number"
          bind:value={resultsCountPerPage}
          min="1"
          max="100"
          class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300/40 dark:focus:ring-slate-500/40 focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Maximum number of search results to analyze in a page
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div
      class="px-6 py-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/30 dark:bg-slate-800/30"
    >
      <button
        on:click={() => handlePopupSubmit(web, resultsCountPerPage)}
        class="w-full px-4 py-3 bg-slate-600 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Save class="w-4 h-4" />
        Apply Settings
      </button>
    </div>
  </div>
</div>
