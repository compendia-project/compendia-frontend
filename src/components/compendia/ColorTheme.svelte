<script>
  import { theme } from "$stores/store.js";

  function toggleTheme() {
    theme.update((current) => {
      const newTheme = current === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }
</script>

<button
  on:click={toggleTheme}
  class="fixed top-7 right-4 z-50 p-1.5 rounded-full
         bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
         border border-gray-200 dark:border-gray-700
         shadow-sm hover:shadow-md
         text-gray-600 dark:text-gray-300
         hover:text-gray-900 dark:hover:text-gray-100
         transition-all duration-300
         hover:-translate-y-0.5
         active:translate-y-0
         focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50
         w-8 h-8 flex items-center justify-center"
  aria-label="Toggle dark mode"
>
  {#if $theme === "light"}
    <!-- Moon icon (dark mode) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  {:else}
    <!-- Sun icon (light mode) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
      />
    </svg>
  {/if}
</button>
