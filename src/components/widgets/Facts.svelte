<script>
  import * as d3 from "d3";
  import tippy from "tippy.js";

  export let cluster;
  export let stats;
  export let radius;
  export let yearColors;
  export let width, height;
  export let curMergedId;
  export let articlesDict;

  let circleData = [];
  const smallCircleRadius = 6;
  const padding = 5;

  function getColor(year) {
    let found = yearColors.find((entry) => entry.year == year);
    return found ? found.color : "#c6bea9bf";
  }

  function getActiveColor(year, isActive, factsEmpty) {
    const color = getColor(year);
    if (factsEmpty || isActive) {
      return color;
    }
    return "#ced4da69";
  }

  function getActiveFactGroupIds(cluster, curMergedId) {
    const mergedFact = cluster.merged_facts.find((mergedFact) => {
      return mergedFact.merged_id === curMergedId;
    });

    if (mergedFact) {
      return mergedFact.merged_fact_group_ids;
    }

    return null;
  }

  let isReady = false;

  $: if (cluster && stats && radius && yearColors && width && height) {
    let max_fact_groups = stats.max_fact_groups;
    const anglePerFact = Math.PI / (max_fact_groups - 1);
    circleData = [];

    const activeFactGroupIds = getActiveFactGroupIds(cluster, curMergedId);

    cluster.all_fact_groups
      .sort((a, b) => {
        const getMaxYear = (factGroup) => {
          const years = factGroup.fact_group_facts.map((f) => {
            const year = parseInt(f.article.year);
            return isNaN(year) ? Infinity : year;
          });
          return Math.max(...years);
        };

        const maxYearA = getMaxYear(a);
        const maxYearB = getMaxYear(b);

        return maxYearA - maxYearB;
      })
      .forEach((factGroup, i) => {
        const factGroupId = factGroup.fact_group_id;
        const factsEmpty = activeFactGroupIds === null;
        const isActive = activeFactGroupIds?.includes(factGroupId) ?? false;
        let smallCircles = [];
        let lineSegments = [];
        const angle = i * anglePerFact;
        factGroup.fact_group_facts.forEach((fact, j) => {
          let x1 = 0;
          let y1 = 0;
          let x2 = 0;
          let y2 = 0;
          if (j === 0) {
            x1 = radius * Math.cos(angle);
            y1 = radius * Math.sin(angle);
          } else {
            x1 = smallCircles[j - 1].x;
            y1 = smallCircles[j - 1].y;
            x1 = x1 + smallCircleRadius * Math.cos(angle);
            y1 = y1 + smallCircleRadius * Math.sin(angle);
          }

          const distance = radius + (j + 1) * (2 * smallCircleRadius + padding);
          const x = distance * Math.cos(angle);
          const y = distance * Math.sin(angle);
          x2 = x - smallCircleRadius * Math.cos(angle);
          y2 = y - smallCircleRadius * Math.sin(angle);
          const article = fact.article;
          smallCircles.push({
            x,
            y,
            color: getActiveColor(parseInt(article.year), isActive, factsEmpty),
            fact: fact,
            isActive: isActive,
          });
          lineSegments.push({ x1, y1, x2, y2 });
        });

        const lastCircle = smallCircles[smallCircles.length - 1];
        if (lastCircle) {
          const angle = Math.atan2(lastCircle.y, lastCircle.x);

          const adjustedX = lastCircle.x - smallCircleRadius * Math.cos(angle);
          const adjustedY = lastCircle.y - smallCircleRadius * Math.sin(angle);

          const lineData = {
            x: adjustedX,
            y: adjustedY,
          };

          circleData.push({
            lineData: lineData,
            lineSegments: lineSegments,
            smallCircleData: smallCircles,
          });
        }
      });
    isReady = true;
  }

  function tooltip(node, fact) {
    const articleID = parseInt(fact.fact_id.split("_")[0]);
    tippy(node, {
      content: `
      <div class="tooltip-content">
        <p>${fact.fact_content}</p>
        <div class="articles-container">
            <a target="_blank" href="${
              fact.article.url
            }" style="color: transparent;" >
             <img src=${articlesDict[articleID].favicon} alt=${
               articlesDict[articleID].source
             } class="w-5 h-5 bg-[#f1f3f4] rounded-full " />
              </a>
          <span class="text-xs text-gray-400 truncate max-w-[110px] pt-1 block">${
            articlesDict[articleID].source
          }</span>
          <span class="fact-count_" style="background-color:#e2e2e2c7; color:${getColor(
            fact.article.year
          )};">${fact.article.year}</span>
        </div>
      </div>
    `,
      allowHTML: true,
      theme: "custom",
      animation: false,
      delay: [0, 0],
      interactive: true,
      placement: "top",
      appendTo: () => document.body,
    });
  }
</script>

{#if isReady}
  {#each circleData as { lineData, lineSegments, smallCircleData }}
    {#each lineSegments as { x1, y1, x2, y2 }}
      <line {x1} {y1} {x2} {y2} class="stroke-[var(--fact-line-stroke)] dark:stroke-[var(--fact-line-stroke-dark)] stroke-1"  />
    {/each}
    {#each smallCircleData as { x, y, color, fact, isActive }}
      {#if isActive}
        <circle
          cx={x}
          cy={y}
          r={smallCircleRadius + 2}
          class="fill-[var(--fact-circle-fill)] dark:fill-[var(--fact-circle-fill-dark)] cursor-pointer"
          id={`fact${fact.fact_id}`}
          use:tooltip={fact}
        />
      {/if}
      <circle
        cx={x}
        cy={y}
        r={smallCircleRadius}
        fill={color}
        id={`fact${fact.fact_id}`}
        use:tooltip={fact}
        style="cursor: pointer;"
      />
    {/each}
  {/each}
{/if}

<style>
  :global([data-tippy-root]) {
    /* background-color: rgba(0, 0, 0, 0.9); */
    background-color: var(--tooltip-bg);
    border-radius: 0.5rem;
    padding: 1rem;
    font-size: 14px;
    /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); */
    border: 1px solid var(--article-card-border);
    max-width: 250px;
    /* color: #f5f5f5; */
    color: var(--tooltip-text);
  }

  :global(.tippy-box[data-theme~="custom"]) {
    /* background-color: rgba(0, 0, 0, 0.9); */
    background-color: var(--tooltip-bg);
    color: var(--tooltip-text);
    backdrop-filter: blur(4px);
    /* color: #e0e0e0; */
  }

  :global(.tooltip-content) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
  }

  :global(.tooltip-content p) {
    margin: 0;
    line-height: 1.4;
  }

  :global(.tooltip-content) {
    font-weight: bold;
    font-size: 0.85rem;
    /* color: #76c7c0; */
    color: var(--tooltip-text);
    /* text-align: justify; */
  }

  :global(.fact-count) {
    font-weight: bold;
    font-size: 0.85rem;
    position: static;
    bottom: 0;
    right: 0;
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 15px;
    margin-right: 10px;
    border: 1px solid var(--article-card-border);
    color: var(--tooltip-text);
    /* background-color: #1b2d3d; */
    background-color: var(--fact-count-bg);
    margin: 0;
  }

  :global(.articles-container) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.5rem;
    justify-content: left;
  }

  :global(.article-circle) {
    width: 20px;
    height: 20px;
    border-radius: 9999px;
    background-color: #394c5f;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #adb2eb;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1rem;
    text-decoration: none;
    cursor: pointer;
  }

  :focus {
    outline: none;
  }
</style>
