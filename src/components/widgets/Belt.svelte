<script>
  import * as d3 from "d3";
  import {
    CIRCLE_CONFIG_LARGE,
    CIRCLE_CONFIG_SMALL,
    SCREEN_WIDTH,
  } from "$utils/circleConstants.js";
  import tippy, { followCursor } from "tippy.js";
  import { draw } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onDestroy } from "svelte";

  export let circles;
  export let width;
  export let height;
  export let shared_articles;
  export let yearColors;
  export let articlesDict;
  export let curMergedId;
  export let limit;
  export let visibleClusterIds = new Set();
  export let isVisible = true;
  export let visibleClusters = [];
  export let clusters;

  let CIRCLE_CONFIG =
    window.innerWidth > SCREEN_WIDTH
      ? CIRCLE_CONFIG_LARGE
      : CIRCLE_CONFIG_SMALL;

  const circleRadius = CIRCLE_CONFIG.BELT_RADIUS;

  $: activeClusterId = curMergedId?.split("_")[0];

  function getPerimeterPoint(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy)
    let angle;
    if (length === 0) {
      // If circles are at the same position, use default angle
      angle = -Math.PI / 2; // Top of circle
    } else {
      // Determine if the target circle is to the right or left
      if (dx > 0) {
        // Target is to the right - use 65 degrees to the right from top
        angle = -Math.PI / 2 + (65 * Math.PI / 180);
      } else {
        // Target is to the left - use 65 degrees to the left from top
        angle = -Math.PI / 2 - (65 * Math.PI / 180);
      }
    }
    
    return {
      x: start.x + circleRadius * Math.cos(angle),
      y: start.y + circleRadius * Math.sin(angle),
    };
  }

  // Cleanup interval on component destroy
  onDestroy(() => {
    if (timeInterval) {
      clearInterval(timeInterval);
    }
  });

  let lineData = [];

  function getCircleById(clusterId) {
    return circles.find((circle) => circle.id === clusterId);
  }

  function getColor(year) {
    let found = yearColors.find((entry) => entry.year == year);
    return found ? found.color : "#c6bea9bf";
  }

  function getStartAndEndClusters(article) {
    const startCluster = article.start_cluster;
    const endCluster = article.end_cluster;
    let startScore;
    let endScore;
    clusters.forEach((cluster) => {
      if (cluster.cluster_id == startCluster) {
        startScore = cluster["cluster_similarity_score"];
      }
      if (cluster.cluster_id == endCluster) {
        endScore = cluster["cluster_similarity_score"];
      }
    });
    if (startScore > endScore) {
      article.start_cluster = endCluster;
      article.end_cluster = startCluster;
    }
    return [startCluster, endCluster];
  }

  // Track when each cluster becomes visible for individual belt timing
  let clusterVisibilityTime = new Map();
  let currentTime = Date.now();
  let newlyVisibleClusters = new Set();
  let animatedBelts = new Set();
  let alreadyAnimatedBelts = new Set();

  // Update current time periodically for reactive belt visibility
  let timeInterval;
  $: if (visibleClusters.length > 0) {
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
      currentTime = Date.now();
    }, 50);
  }

  $: {
    // Track newly visible clusters
    const baseTime = Date.now();
    newlyVisibleClusters.clear();

    visibleClusters.forEach((cluster) => {
      if (!clusterVisibilityTime.has(cluster.cluster_id)) {
        const animationEndTime = 1300; // Start right after circle animation (2000ms)
        clusterVisibilityTime.set(
          cluster.cluster_id,
          baseTime + animationEndTime
        );
        newlyVisibleClusters.add(cluster.cluster_id);
      }
    });

    // Clean up times for clusters no longer visible
    for (let clusterId of clusterVisibilityTime.keys()) {
      if (!visibleClusterIds.has(clusterId)) {
        clusterVisibilityTime.delete(clusterId);
        // Remove belts connected to this cluster from animated sets
        const keysToDelete = [];
        animatedBelts.forEach((beltKey) => {
          const [cluster1, cluster2] = beltKey.split("_").map(Number);
          if (cluster1 === clusterId || cluster2 === clusterId) {
            keysToDelete.push(beltKey);
          }
        });
        keysToDelete.forEach((key) => {
          animatedBelts.delete(key);
          alreadyAnimatedBelts.delete(key);
        });
      }
    }
  }

  $: if (circles && width && height && shared_articles) {
    lineData = shared_articles
      .filter((article) => {
        // If both limit values are 0, no lines are visible
        if (limit[0] === 0 && limit[1] === 0) {
          return false;
        }
        // If both limit values are the same, show lines with that exact count
        else if (limit[0] === limit[1]) {
          return article.count === limit[0];
        }
        // If limit values are different, show lines with count in [x,y] range
        else {
          return article.count >= limit[0] && article.count <= limit[1];
        }
      })
      .filter(
        (article) =>
          visibleClusterIds.has(article.start_cluster) &&
          visibleClusterIds.has(article.end_cluster)
      )
      .map((article) => {
        getStartAndEndClusters(article);
        const startCircle = getCircleById(article.start_cluster);
        const endCircle = getCircleById(article.end_cluster);

        if (startCircle && endCircle) {
          // Calculate perimeter points
          const startPoint = getPerimeterPoint(startCircle, endCircle);
          const endPoint = getPerimeterPoint(endCircle, startCircle);

          // Calculate when this belt should become visible
          const startTime =
            clusterVisibilityTime.get(article.start_cluster) || 0;
          const endTime = clusterVisibilityTime.get(article.end_cluster) || 0;
          const beltVisibilityTime = Math.max(startTime, endTime);

          // Create consistent belt key (order clusters to avoid duplicates)
          const sortedClusters = [
            article.start_cluster,
            article.end_cluster,
          ].sort((a, b) => a - b);
          const beltKey = `${sortedClusters[0]}_${sortedClusters[1]}`;

          // Check if this belt should be animated (connected to newly visible cluster)
          const isNewBelt =
            newlyVisibleClusters.has(article.start_cluster) ||
            newlyVisibleClusters.has(article.end_cluster);
          const hasBeenAnimated = alreadyAnimatedBelts.has(beltKey);
          const shouldAnimate = isNewBelt && !hasBeenAnimated;

          if (shouldAnimate) {
            animatedBelts.add(beltKey);
            alreadyAnimatedBelts.add(beltKey);
          }

          return {
            start: { x: startPoint.x, y: startPoint.y },
            end: { x: endPoint.x, y: endPoint.y },
            beltWidth: (() => {
              // Calculate scaled belt width based on limit range
              const minLimit = Math.min(limit[0], limit[1]);
              const maxLimit = Math.max(limit[0], limit[1]);
              const limitRange = maxLimit - minLimit;

              if (maxLimit === minLimit) {
                return 3;
              } else {
                if (minLimit === 0 || minLimit === 1) {
                  return article.count * 3;
                } else {
                  return (article.count - minLimit + 1) * 3;
                }
              }
            })(),
            articles: article.articles,
            startCluster: article.start_cluster,
            endCluster: article.end_cluster,
            visibilityTime: beltVisibilityTime,
            shouldAnimate: shouldAnimate,
            beltKey: beltKey,
          };
        }
        return null;
      })
      .filter((data) => data !== null);
  }

  let curve = d3
    .linkHorizontal()
    .x((d) => d.x)
    .y((d) => d.y);

  function tooltip(node, articles) {
    articles = d3.sort(articles, (a, b) => d3.ascending(a.year, b.year));
    tippy(node, {
      content: `
      <div class="tooltip-content">
        <div class="tooltip-topic">Shared Articles</div>
        <div class="content-container">
         ${articles
           .map(
             (article) => `
        <div class="article-card">
          <p class="article-title text-clamp">${
            articlesDict[article.article_id].result_title
          }</p>
          <div class="article-content_">
            <a target="_blank" href="${
              article.url
            }" style="text-decoration: none; color: transparent;" >
            <img src=${articlesDict[article.article_id].favicon} alt=${
              articlesDict[article.article_id].source
            } class="w-5 h-5 bg-[#f1f3f4] rounded-full " />
            </a>
            <span class="text-xs text-gray-400 truncate block">${
              articlesDict[article.article_id].source
            }</span>
            <span class="fact-count_" style="background-color:#e2e2e2c7; color:${getColor(
              article.year
            )};">${article.year}</span>
          </div>
        </div>
         `
           )
           .join("")}
          </div>
      </div>
    `,
      allowHTML: true,
      theme: "custom",
      animation: false,
      delay: [0, 0],
      interactive: true,
      followCursor: true,
      placement: "top",
      appendTo: () => document.body,
      plugins: [followCursor],
    });
  }
</script>

{#if isVisible}
  {#each lineData as { start, end, beltWidth, articles, startCluster, endCluster, visibilityTime, shouldAnimate, beltKey }, i (beltKey)}
    {#if currentTime >= visibilityTime}
      <path
        class:inactive={curMergedId &&
          startCluster !== activeClusterId &&
          endCluster !== activeClusterId}
        d={curve({ source: start, target: end })}
        class="fill-none stroke-[var(--belt-stroke)] dark:stroke-[var(--belt-stroke-dark)] cursoe-pointer hover:stroke-[#9f9f9f] dark:hover:stroke-[#698496] transition-colors"
        stroke-width={Math.max(beltWidth, 1)}
        use:tooltip={articles}
        stroke-linecap="butt"
        in:draw={shouldAnimate
          ? { duration: 2000, delay: 0, easing: quintOut }
          : { duration: 0 }}
        out:draw={{ duration: 600, easing: quintOut }}
      />
    {/if}
  {/each}
{/if}

<style>
  path {
    transition: all 0.2s ease-out;
    stroke-linecap: butt;
    cursor: pointer;
  }

  path:hover {
    isolation: isolate; /* Creates new stacking context */
    stroke-opacity: 1 !important;
  }

  path.inactive {
    opacity: 0.2;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .tooltip-topic {
    font-weight: bold;
    font-size: 0.85rem;
    margin-bottom: 10px;
    text-align: center;
    /* color: #adb2eb; */
    color: var(--tooltip-text);
    text-transform: capitalize;
    /* border-bottom: 1px solid #ddd; */
    border-bottom: 1px solid var(--article-card-border);
    padding-bottom: 6px;
  }

  :global(.article-card) {
    position: relative;
    /* background-color: #1a2633; */
    background-color: var(--article-card-bg);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 5px;
    margin-right: 2px;
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
    border: 1px solid var(--article-card-border);
    transition: transform 0.2s ease;
  }

  :global(.article-card:hover) {
    transform: translateY(-2px);
    border-color: var(--tooltip-text);
  }

  :global(.article-content_) {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  :global(.article-title) {
    font-size: 0.85rem;
    margin-bottom: 8px !important;
    /* color: #d1e0eb; */
    color: var(--tooltip-text);
  }

  :global(.fact-count_) {
    font-weight: bold;
    font-size: 0.85rem;
    margin-left: auto;
    padding: 2px 6px;
    border-radius: 4px;
    /* background-color: #2d4050; */
    background-color: var(--article-card-bg);
    border: 1px solid var(--article-card-border);
    position: static;
  }

  :global(.text-clamp) {
    display: -webkit-box;
    -webkit-line-clamp: 3; /* Limit to 3 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.content-container) {
    padding-top: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
</style>
