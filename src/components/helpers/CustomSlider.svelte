<script>
  import { createEventDispatcher } from 'svelte';
  import { Info } from 'lucide-svelte';
  import tippy from 'tippy.js';
  
  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let label = '';
  export let leftLabel = '';
  export let rightLabel = '';
  export let showTicks = true;
  export let tickStep = null; // Custom tick step, if null will use step
  export let showTickValues = true; // Show tick value labels
  export let tickValueStep = null; // Custom step for showing tick values, if null will use tickStep or step
  export let disabled = false;
  export let tooltipText = ''; // Tooltip text for the info icon
  
  const dispatch = createEventDispatcher();
  
  let sliderContainer;
  let isDragging = false;
  
  // Calculate progress and thumb position
  $: sliderProgress = ((value - min) / (max - min)) * 100;
  $: thumbPosition = sliderProgress === 0 ? -2.375 : sliderProgress === 100 ? 102.375 : sliderProgress;
  
  // Calculate tick marks
  $: tickValues = showTicks ? generateTickValues() : [];
  
  // Calculate which tick values to show labels for
  $: visibleTickValues = showTickValues ? generateVisibleTickValues() : [];
  
  function generateTickValues() {
    const actualStep = tickStep || step;
    const values = [];
    for (let i = min + actualStep; i < max; i += actualStep) {
      values.push(i);
    }
    return values;
  }
  
  function generateVisibleTickValues() {
    const actualStep = tickValueStep || tickStep || step;
    const values = [];
    for (let i = min + actualStep; i < max; i += actualStep) {
      values.push(i);
    }
    return values;
  }
  
  function handleSliderClick(event) {
    if (!sliderContainer || disabled) return;
    const rect = sliderContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = Math.round(min + percentage * (max - min));
    value = Math.max(min, Math.min(max, newValue));
    dispatch('change', { value });
  }
  
  function handleMouseDown(event) {
    if (disabled) return;
    isDragging = true;
    handleSliderClick(event);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  function handleMouseMove(event) {
    if (!isDragging) return;
    handleSliderClick(event);
  }
  
  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  function handleKeyDown(event) {
    if (disabled) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      value = Math.max(min, value - step);
      dispatch('change', { value });
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      value = Math.min(max, value + step);
      dispatch('change', { value });
      event.preventDefault();
    }
  }
</script>

<div class="relative mb-10 mt-6">
  <!-- Top labels -->
  {#if leftLabel}
    <span class="text-[10px] text-gray-600 dark:text-gray-300 absolute start-0 -top-6 -ml-[30px]">{leftLabel}</span>
  {/if}
  {#if rightLabel}
    <span class="text-[10px] text-gray-600 dark:text-gray-300 absolute end-0 -top-6 -mr-[30px]">{rightLabel}</span>
  {/if}
  
  <!-- Custom slider track -->
  <div 
    bind:this={sliderContainer}
    class="relative w-full h-1 rounded-lg cursor-pointer slider-track {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
    style="--slider-progress: {sliderProgress}%"
    on:mousedown={handleMouseDown}
    on:keydown={handleKeyDown}
    tabindex="0"
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-disabled={disabled}
  >
    <!-- Custom thumb -->
    <div 
      class="absolute w-3 h-3 rounded-full border border-blue-300 dark:border-blue-400 shadow-sm dark:shadow-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-xl bg-white dark:bg-gray-200 {disabled ? 'cursor-not-allowed' : ''}"
      style="left: {thumbPosition}%; top: 50%; transform: translate({sliderProgress === 0 ? '0' : sliderProgress === 100 ? '-100%' : '-50%'}, -50%); backdrop-filter: blur(10px);"
    ></div>
    
    <!-- Tick marks on slider -->
    {#if showTicks}
      <span class="absolute start-0 top-1/2 w-0.5 h-2.5 bg-blue-200 dark:bg-gray-500 rounded transform -translate-y-1/2" aria-hidden="true"></span>
      
      {#each tickValues as tickValue}
        <span
          class="absolute top-1/2 w-0.5 h-2.5 bg-blue-200 dark:bg-gray-500 rounded transform -translate-x-1/2 -translate-y-1/2"
          style="left: {((tickValue - min) / (max - min)) * 100}%"
          aria-hidden="true"
        ></span>
      {/each}
      
      <span class="absolute end-0 top-1/2 w-0.5 h-2.5 bg-blue-200 dark:bg-gray-500 rounded transform -translate-y-1/2" aria-hidden="true"></span>
    {/if}
  </div>
  
  <!-- Number labels below slider -->
  {#if showTickValues}
    <span class="text-[11px] text-gray-500 dark:text-gray-400 absolute start-0 -ml-[2px] top-2.5">{min}</span>
    
    {#each visibleTickValues as tickValue}
      <span 
        class="text-[11px] text-gray-500 dark:text-gray-400 absolute -translate-x-1/2 top-2.5"
        style="left: {((tickValue - min) / (max - min)) * 100}%"
      >
        {tickValue}
      </span>
    {/each}
    
    <span class="text-[11px] text-gray-500 dark:text-gray-400 absolute end-0 -mr-[8px] top-2.5">{max}</span>
  {/if}
  
  <!-- Centered label below numbers -->
  {#if label}
    <div class="absolute w-full top-8 flex justify-center gap-1">
      <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">{label}</span>
     {#if tooltipText}
        <div 
          class="info-icon cursor-help"
          use:tippy={{ content: tooltipText, placement: 'top', theme: 'light-border',  animation: false,
      delay: [0, 0] }}
        >
          <Info size={12} class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Custom slider track styling */
  .slider-track {
    background: linear-gradient(to right, #79a1fc var(--slider-progress), #dee8ff var(--slider-progress));
  }
  
  :global(.dark) .slider-track {
    background: linear-gradient(to right, #6366f1 var(--slider-progress), #374151 var(--slider-progress));
  }
</style>