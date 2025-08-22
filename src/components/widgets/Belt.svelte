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
  const smallDxThreshold = 100;

  $: activeClusterId = curMergedId?.split("_")[0];

  function getTitleRectConnectionPoint(start, end, isStart = true) {
    const dx = end.x - start.x;
    const startCluster = clusters.find((c) => c.cluster_id === start.id);
    const textLength = startCluster?.title?.length || 0;
    const rectWidth = textLength * 7.5 + 30;

    let connectionX, connectionY;

    if (Math.abs(dx) < smallDxThreshold) {
      connectionX = start.x + -rectWidth / 2;
    } else {
      if (dx > 0) {
        connectionX = start.x + rectWidth / 2;
      } else {
        connectionX = start.x + -rectWidth / 2;
      }
    }

    connectionY = start.y + (-circleRadius - 51);

    return {
      x: connectionX,
      y: connectionY,
    };
  }

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

  let clusterVisibilityTime = new Map();
  let currentTime = Date.now();
  let newlyVisibleClusters = new Set();
  let animatedBelts = new Set();
  let alreadyAnimatedBelts = new Set();
  let timeInterval;
  $: if (visibleClusters.length > 0) {
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
      currentTime = Date.now();
    }, 50);
  }

  $: {
    const baseTime = Date.now();
    newlyVisibleClusters.clear();

    visibleClusters.forEach((cluster) => {
      if (!clusterVisibilityTime.has(cluster.cluster_id)) {
        const animationEndTime = 1300;
        clusterVisibilityTime.set(
          cluster.cluster_id,
          baseTime + animationEndTime
        );
        newlyVisibleClusters.add(cluster.cluster_id);
      }
    });

    for (let clusterId of clusterVisibilityTime.keys()) {
      if (!visibleClusterIds.has(clusterId)) {
        clusterVisibilityTime.delete(clusterId);
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
        if (limit[0] === 0 && limit[1] === 0) {
          return false;
        } else if (limit[0] === limit[1]) {
          return article.count === limit[0];
        } else {
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
          const startPoint = getTitleRectConnectionPoint(
            startCircle,
            endCircle
          );
          const endPoint = getTitleRectConnectionPoint(
            endCircle,
            startCircle,
            false
          );

          const startTime =
            clusterVisibilityTime.get(article.start_cluster) || 0;
          const endTime = clusterVisibilityTime.get(article.end_cluster) || 0;
          const beltVisibilityTime = Math.max(startTime, endTime);

          const sortedClusters = [
            article.start_cluster,
            article.end_cluster,
          ].sort((a, b) => a - b);
          const beltKey = `${sortedClusters[0]}_${sortedClusters[1]}`;

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
              const minLimit = Math.min(limit[0], limit[1]);
              const maxLimit = Math.max(limit[0], limit[1]);

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

  const linkHorizontal = d3
    .linkHorizontal()
    .x((d) => d.x)
    .y((d) => d.y);

  function createCurve(source, target) {
    const dx = target.x - source.x;
    const absDx = Math.abs(dx);

    if (absDx < smallDxThreshold) {
      const startX = source.x;
      const startY = source.y;
      const endX = target.x;
      const endY = target.y;
      const dy = endY - startY;
      const absDy = Math.abs(dy);
      const leftOffset = Math.max(80, absDy * 0.25);

      return `M${startX},${startY}C${startX - leftOffset},${
        startY + dy * 0.3
      } ${endX - leftOffset},${endY - dy * 0.3} ${endX},${endY}`;
    } else {
      return linkHorizontal({ source, target });
    }
  }

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
        <a target="_blank" href="${
          article.url
        }" style="text-decoration: none; color: inherit;" class="article-card-link">
          <div class="article-card">
            <p class="article-title text-clamp">${
              articlesDict[article.article_id].result_title
            }</p>
            <div class="article-content_">
              <img src=${articlesDict[article.article_id].favicon} alt=${
                articlesDict[article.article_id].source
              } class="w-5 h-5 bg-[#f1f3f4] rounded-full " />
              <span class="text-xs text-gray-400 truncate block">${
                articlesDict[article.article_id].source
              }</span>
              <span class="fact-count_" style="background-color:#e2e2e2c7; color:${getColor(
                article.year
              )};">${article.year}</span>
            </div>
          </div>
        </a>
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
        d={createCurve(start, end)}
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
    isolation: isolate;
    stroke-opacity: 1 !important;
  }

  path.inactive {
    opacity: 0.2;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .tooltip-topic {
    font-weight: bold;
    font-size: 0.85rem;
    margin-bottom: 10px;
    text-align: center;
    color: var(--tooltip-text);
    text-transform: capitalize;
    border-bottom: 1px solid var(--article-card-border);
    padding-bottom: 6px;
  }

  :global(.article-card) {
    position: relative;
    background-color: var(--article-card-bg);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 5px;
    margin-right: 2px;
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
    color: var(--tooltip-text);
  }

  :global(.fact-count_) {
    font-weight: bold;
    font-size: 0.85rem;
    margin-left: auto;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--article-card-bg);
    border: 1px solid var(--article-card-border);
    position: static;
  }

  :global(.text-clamp) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.content-container) {
    padding-top: 10px;
    max-height: 400px;
    overflow-y: auto;
  }
</style>
