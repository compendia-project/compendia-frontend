<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  export let radius;
  export let text;
  const lineHeight = 18;
  let lines;
  
  function createWords(text) {
    const words = text.split(/\s+/g).filter((d) => d);
    return words;
  }
  
  function measureWidth(text) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = "15px Arial, sans-serif";  // Changed font to Arial, sans-serif
    return ctx.measureText(text).width;
  }
  
  function createLines(words, targetWidth) {
    let line;
    let lineWidth0 = Infinity;
    const lines = [];
    for (let i = 0, n = words.length; i < n; ++i) {
      let lineText1 = (line ? line.text + " " : "") + words[i];
      let lineWidth1 = measureWidth(lineText1);
      if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
        line.width = lineWidth0 = lineWidth1;
        line.text = lineText1;
      } else {
        lineWidth0 = measureWidth(words[i]);
        line = { width: lineWidth0, text: words[i] };
        lines.push(line);
      }
    }
    return lines;
  }
  
  function textRadius(lines, lineHeight) {
    let radius = 0;
    for (let i = 0, n = lines.length; i < n; ++i) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
      const dx = lines[i].width / 2;
      radius = Math.max(radius, Math.sqrt(dx ** 2 + dy ** 2));
    }
    return radius;
  }
  
  function isNumber(word) {
    return /^[-$]?\d+(\.\d+)?%?$/.test(word);
  }
  
  onMount(() => {
    radius = radius - 2;
    const words = createWords(text);
    const targetWidth = Math.sqrt(measureWidth(text.trim()) * lineHeight);
    lines = createLines(words, targetWidth);
  });
  
  $: if (text && radius) {
    // Recalculate lines when text or radius changes
    radius = radius - 2;
    const words = createWords(text);
    const targetWidth = Math.sqrt(measureWidth(text.trim()) * lineHeight);
    lines = createLines(words, targetWidth);
  }
</script>

<g
  style="font: 10px; font-family: Arial, sans-serif; cursor: pointer;"
  class="fill-[var(--circle-text-fill)] dark:fill-[var(--circle-text-fill-dark)]"
  text-anchor="middle"
  in:fly={{ y: 10, duration: 300 }}
  out:fade={{ duration: 200 }}
>
  {#if lines && radius}
    <text
      transform="translate(0,0) scale({radius / textRadius(lines, lineHeight)})"
    >
      {#each lines as line, i}
        <tspan x="0" y={(i - lines.length / 2 + 0.8) * lineHeight}>
          <!-- {#each line.text.split(' ') as word}
            <tspan style="fill:{isNumber(word) ? 'red' : 'white'}">{ word + " "}</tspan>
          {/each} -->
          {line.text}
        </tspan>
      {/each}
    </text>
  {/if}
</g>