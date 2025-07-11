<script>
  import { createEventDispatcher } from 'svelte';
  import { Info } from 'lucide-svelte';
  import tippy from 'tippy.js';
  
  export let value = [0, 1]; // Array with [min, max] values
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let label = '';
  export let leftLabel = '';
  export let rightLabel = '';
  export let tooltipText = ''; // Tooltip text for the info icon
  export let showTicks = true;
  export let tickStep = null; // Custom tick step, if null will use step
  export let disabled = false;
  
  const dispatch = createEventDispatcher();
  
  let sliderContainer;
  let isDragging = false;
  let activeThumb = null; // 'min' or 'max'
  
  // Ensure value is always an array with two elements
  $: if (!Array.isArray(value) || value.length !== 2) {
    value = [min, max];
  }
  
  // Calculate progress and thumb positions
  $: minProgress = ((value[0] - min) / (max - min)) * 100;
  $: maxProgress = ((value[1] - min) / (max - min)) * 100;
  $: minThumbPosition = minProgress === 0 ? -2.375 : minProgress === 100 ? 102.375 : minProgress;
  $: maxThumbPosition = maxProgress === 0 ? -2.375 : maxProgress === 100 ? 102.375 : maxProgress;
  
  // Calculate tick marks
  $: tickValues = showTicks ? generateTickValues() : [];
  
  function generateTickValues() {
    const actualStep = tickStep || step;
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
    
    // Determine which thumb to move based on proximity
    const distanceToMin = Math.abs(newValue - value[0]);
    const distanceToMax = Math.abs(newValue - value[1]);
    
    // Special case: when both thumbs are at the same position
    if (value[0] === value[1]) {
      // If clicking to the right of the current position, move max thumb
      // If clicking to the left or at the same position, move min thumb
      if (newValue > value[0]) {
        const newMax = Math.min(max, Math.max(value[0], newValue));
        value = [value[0], newMax];
        activeThumb = 'max';
      } else {
        const newMin = Math.max(min, Math.min(value[1], newValue));
        value = [newMin, value[1]];
        activeThumb = 'min';
      }
    } else if (distanceToMin < distanceToMax) {
      // Move min thumb, allow it to be at the same location as max
      const newMin = Math.max(min, Math.min(value[1], newValue));
      value = [newMin, value[1]];
      activeThumb = 'min';
    } else {
      // Move max thumb, allow it to be at the same location as min
      const newMax = Math.min(max, Math.max(value[0], newValue));
      value = [value[0], newMax];
      activeThumb = 'max';
    }
    
    dispatch('change', { value });
  }
  
  function handleThumbMouseDown(event, thumb) {
    if (disabled) return;
    event.stopPropagation();
    isDragging = true;
    activeThumb = thumb;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  function handleMouseDown(event) {
    if (disabled) return;
    isDragging = true;
    handleSliderClick(event);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  function handleMouseMove(event) {
    if (!isDragging || !sliderContainer) return;
    
    const rect = sliderContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percentage * (max - min));
    
    if (activeThumb === 'min') {
      // Move min thumb, allow it to be at the same location as max
      const newMin = Math.max(min, Math.min(value[1], newValue));
      value = [newMin, value[1]];
    } else if (activeThumb === 'max') {
      // Move max thumb, allow it to be at the same location as min
      const newMax = Math.min(max, Math.max(value[0], newValue));
      value = [value[0], newMax];
    }
    
    dispatch('change', { value });
  }
  
  function handleMouseUp() {
    isDragging = false;
    activeThumb = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  function handleKeyDown(event, thumb) {
    if (disabled) return;
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      if (thumb === 'min') {
        const newMin = Math.max(min, value[0] - step);
        value = [newMin, value[1]];
      } else {
        const newMax = Math.max(value[0], value[1] - step);
        value = [value[0], newMax];
      }
      dispatch('change', { value });
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      if (thumb === 'min') {
        const newMin = Math.min(value[1], value[0] + step);
        value = [newMin, value[1]];
      } else {
        const newMax = Math.min(max, value[1] + step);
        value = [value[0], newMax];
      }
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
    style="--min-progress: {minProgress}%; --max-progress: {maxProgress}%"
    on:mousedown={handleMouseDown}
    tabindex="0"
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow="{value[0]} to {value[1]}"
    aria-disabled={disabled}
  >
    <!-- Min thumb -->
    <div 
      class="absolute w-3 h-3 rounded-full border border-blue-300 dark:border-blue-400 shadow-sm dark:shadow-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-xl bg-white dark:bg-gray-200 {disabled ? 'cursor-not-allowed' : 'cursor-grab'}"
      style="left: {minThumbPosition}%; top: 50%; transform: translate({minProgress === 0 ? '0' : minProgress === 100 ? '-100%' : '-50%'}, -50%); backdrop-filter: blur(10px);"
      on:mousedown={(e) => handleThumbMouseDown(e, 'min')}
      on:keydown={(e) => handleKeyDown(e, 'min')}
      tabindex="0"
      role="slider"
      aria-label="Minimum value"
      aria-valuemin={min}
      aria-valuemax={value[1]}
      aria-valuenow={value[0]}
    ></div>
    
    <!-- Max thumb -->
    <div 
      class="absolute w-3 h-3 rounded-full border border-blue-300 dark:border-blue-400 shadow-sm dark:shadow-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-xl bg-white dark:bg-gray-200 {disabled ? 'cursor-not-allowed' : 'cursor-grab'}"
      style="left: {maxThumbPosition}%; top: 50%; transform: translate({maxProgress === 0 ? '0' : maxProgress === 100 ? '-100%' : '-50%'}, -50%); backdrop-filter: blur(10px);"
      on:mousedown={(e) => handleThumbMouseDown(e, 'max')}
      on:keydown={(e) => handleKeyDown(e, 'max')}
      tabindex="0"
      role="slider"
      aria-label="Maximum value"
      aria-valuemin={value[0]}
      aria-valuemax={max}
      aria-valuenow={value[1]}
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
  {#if showTicks}
    <span class="text-[11px] text-gray-500 dark:text-gray-400 absolute start-0 -ml-[2px] top-2.5">{min}</span>
    
    {#each tickValues as tickValue}
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
    <div class="absolute w-full top-8 flex justify-center items-center gap-1">
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
  /* Custom range slider track styling */
  .slider-track {
    background: linear-gradient(
      to right, 
      #dee8ff 0%, 
      #dee8ff var(--min-progress), 
      #79a1fc var(--min-progress), 
      #79a1fc var(--max-progress), 
      #dee8ff var(--max-progress), 
      #dee8ff 100%
    );
  }
  
  :global(.dark) .slider-track {
    background: linear-gradient(
      to right, 
      #374151 0%, 
      #374151 var(--min-progress), 
      #6366f1 var(--min-progress), 
      #6366f1 var(--max-progress), 
      #374151 var(--max-progress), 
      #374151 100%
    );
  }
</style>