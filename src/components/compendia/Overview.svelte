<script>
  import { onMount, createEventDispatcher } from "svelte";
  import * as d3 from "d3";
  import YearColor from "$components/widgets/YearColorSpectrum.svelte";
  import Circle from "$components/widgets/Circle.svelte";
  import Belt from "$components/widgets/Belt.svelte";
  import Articles from "$components/compendia/Articles.svelte";
  import RelevanceFilter from "$components/compendia/RelevanceFilter.svelte";
  import {
    CIRCLE_CONFIG_LARGE,
    CIRCLE_CONFIG_SMALL,
    SCREEN_WIDTH,
  } from "$utils/circleConstants.js";

  export let data;
  export let viewportHeight;
  export let viewportWidth;
  export let step;
  export let curMergedId;
  export let value;
  export let items = [];

  let showButton = false;
  let years = data.stats.article_year_range;
  let clusters = data.clusters;
  let shared_articles = data.shared_articles;
  let stats = data.stats;
  let steps = data.steps;
  let articles = data.all_mapped_articles;
  let articlesDict = Object.fromEntries(
    articles.map((item) => [item.id, item])
  );

  let width = viewportWidth;
  let height = viewportHeight - 100;
  let circles = [];
  let yearColors = [];
  let simulation;
  let currentArticles = 0;
  let currentFacts = 0;
  let filteredYearArticleCount;

  let CIRCLE_CONFIG =
    window.innerWidth > SCREEN_WIDTH
      ? CIRCLE_CONFIG_LARGE
      : CIRCLE_CONFIG_SMALL;

  let maxTopics = data.stats.total_clusters;
  let currentTopics = maxTopics < 6 ? maxTopics : 6;
  let visibleClusters = [];
  let visibleClusterIds = new Set();
  let beltsVisible = true;
  let sharedArticleLimit = [0, 1];
  let showFactCircles = true;
  let showCollisionRadius = false; 

  $: collisionRadius =
    currentTopics <= 6
      ? CIRCLE_CONFIG.COLLISION_RADIUS.SMALL
      : currentTopics <= 8
        ? CIRCLE_CONFIG.COLLISION_RADIUS.MEDIUM
        : CIRCLE_CONFIG.COLLISION_RADIUS.LARGE;

  // Event dispatcher for parent communication
  const dispatch = createEventDispatcher();

  // Sort clusters by similarity score and filter based on currentTopics
  $: {
    const sortedClusters = [...clusters].sort(
      (a, b) =>
        (b.cluster_similarity_score || 0) - (a.cluster_similarity_score || 0)
    );
    visibleClusters = sortedClusters.slice(0, currentTopics);
    visibleClusterIds = new Set(visibleClusters.map((c) => c.cluster_id));

    handleStats(sortedClusters);

    // Dispatch visible cluster IDs to parent component
    dispatch("visibleClustersChange", {
      visibleClusterIds: Array.from(visibleClusterIds),
      visibleClusters: visibleClusters,
      currentTopics: currentTopics,
    });
  }

  const handleStats = (sortedClusterData) => {
    // Create a Set to track unique article IDs
    const uniqueArticleIds = new Set();
    let totalFacts = 0;

    for (let cluster of sortedClusterData) {
      if (visibleClusterIds.has(cluster.cluster_id)) {
        // Add each article ID to the Set
        cluster.articles.forEach((article) => uniqueArticleIds.add(article.id));
        totalFacts += cluster["all_original_facts"].length;
      }
    }

    filteredYearArticleCount = getYearArticleCount(articles, uniqueArticleIds);

    currentArticles = uniqueArticleIds.size;
    currentFacts = totalFacts;
  };

  function getYearArticleCount(articles, uniqueArticleIds) {
    const yearCounts = {};

    articles.forEach((article) => {
      if (uniqueArticleIds.has(article.id)) {
        const year = article.year === "Unknown" ? "Unknown" : article.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    return yearCounts;
  }

  const handleRelevanceChange = (event) => {
    currentTopics = event.detail.value;
  };

  const boundaryForce = (alpha) => {
    circles.forEach((d) => {
      // Skip boundary enforcement for circles being dragged
      if (
        d.fx !== null &&
        d.fx !== undefined &&
        d.fy !== null &&
        d.fy !== undefined
      ) {
        return;
      }

      const xMin = width * CIRCLE_CONFIG.BOUNDARIES.X_MIN + d.radius; // 300px / 1920px
      const xMax = width * CIRCLE_CONFIG.BOUNDARIES.X_MAX - d.radius; // (1920 - 400) / 1920
      const yMinRatio =
        currentTopics < 8
          ? CIRCLE_CONFIG.BOUNDARIES.Y_MIN_SMALL
          : CIRCLE_CONFIG.BOUNDARIES.Y_MIN_LARGE;
      const yMin = height * yMinRatio + d.radius;
      const yMax = height * CIRCLE_CONFIG.BOUNDARIES.Y_MAX - d.radius; // (892 - 150) / 892

      if (d.x < xMin) d.x = xMin;
      if (d.x > xMax) d.x = xMax;
      if (d.y < yMin) d.y = yMin;
      if (d.y > yMax) d.y = yMax;
    });
  };

  // Define specific grid layouts for different cluster counts
  const getGridPositions = (width, height, clusterCount) => {
    let positions;

    if (clusterCount === 3) {
      // Linear arrangement for 3 clusters
      positions = CIRCLE_CONFIG.POSITIONS_THREE;
    } else if (clusterCount === 4) {
      // 2x2 grid arrangement for 4 clusters
      positions = CIRCLE_CONFIG.POSITIONS_FOUR;
    } else {
      // Fallback for other counts
      positions = CIRCLE_CONFIG.POSITIONS_TEN;
    }

    return positions.map((pos) => ({
      x: pos.x * width,
      y: pos.y * height,
    }));
  };

  onMount(() => {
    if (!clusters.length) return;

    // Sort clusters by relevance score (cluster_similarity_score)
    const sortedClusters = [...clusters].sort(
      (a, b) =>
        (b.cluster_similarity_score || 0) - (a.cluster_similarity_score || 0)
    );

    // Get predefined grid positions based on cluster count
    const gridPositions = getGridPositions(
      width,
      height,
      sortedClusters.length
    );

    circles = sortedClusters.map((cluster, index) => {
      // Use grid position if available, otherwise fall back to center
      const position = gridPositions[index] || { x: width / 2, y: height / 2 };

      return {
        id: cluster.cluster_id,
        x: position.x,
        y: position.y,
        targetX: position.x,
        targetY: position.y,
        radius: Math.max(
          40 + cluster.number_of_fact_groups,
          cluster.number_of_fact_groups * 4
        ),
      };
    });

    simulation = d3
      .forceSimulation(circles)
      .force("targetX", d3.forceX((d) => d.x).strength(2))
      .force("targetY", d3.forceY((d) => d.y).strength(2))
      // .force("center", d3.forceCenter(width * 0.57, height * 0.45).strength(0.8))
      .force(
        "collide",
        d3
          .forceCollide()
          .strength(1)
          .radius((d) => {
            // Adjust collision radius based on number of circles for better spacing
            return  collisionRadius;
          })
      )
      .force("charge", d3.forceManyBody().strength(-80))
      .force("boundary", boundaryForce)
      .alphaDecay(0.05) // Faster decay for quicker convergence
      .velocityDecay(0.6) // Higher velocity decay for faster settling
      .on("tick", () => {
        // Only trigger reactivity if positions have changed significantly
        // This reduces unnecessary re-renders and makes animation smoother
        let hasSignificantChange = false;
        const threshold = 1.0; // Increased threshold to reduce updates

        for (let i = 0; i < circles.length; i++) {
          const circle = circles[i];
          if (
            circle.lastX === undefined ||
            circle.lastY === undefined ||
            Math.abs(circle.x - circle.lastX) > threshold ||
            Math.abs(circle.y - circle.lastY) > threshold
          ) {
            circle.lastX = circle.x;
            circle.lastY = circle.y;
            hasSignificantChange = true;
          }
        }

        if (hasSignificantChange) {
          circles = [...circles];
        }
      });

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  function handleSvgClick(event) {
    // Handle outside clicks (background clicks)
    if (event.target.id === "open-button" || event.target.id === "close-button")
      return;

    if (event.target.id === "visBack" || event.target.tagName === "svg") {
      resetZoom();
      scrollToTop();
      // Dispatch outside click event
      dispatch("outsideClick", {
        target: event.target.id,
      });
    }
  }

  function handleCircleClick(event) {
    const { clusterId } = event.detail;
    const found = steps.find((step) => step.cluster_id === clusterId);

    if (found) {
      value = found.start_step;
      jumpToItem(value);
      // Dispatch circle click event to parent
      dispatch("circleClick", {
        clusterId: clusterId,
        step: found.start_step,
      });
    }
  }

  function resetZoom() {
    const initialTranslation = { x: width / 2, y: height / 2, scale: 1 };
    d3.select("#visBack g")
      .transition()
      .duration(800)
      .attr(
        "transform",
        `translate(${initialTranslation.x - width / 2}, ${
          initialTranslation.y - height / 2 + 40
        }) scale(${initialTranslation.scale})`
      );
  }

  function circleAction(node) {
    const circleId = Number(node.id.split("-")[1]);
    const circle = circles.find((c) => c.id === circleId);

    if (!circle) {
      console.error("Circle not found:", circleId);
      return;
    }

    d3.select(node).call(
      d3
        .drag()
        .on("start", (event) => dragStarted(event, circle))
        .on("drag", (event) => dragged(event, circle))
        .on("end", (event) => dragEnded(event, circle))
    );
  }

  // Helper function to apply boundary constraints
  const applyBoundaryConstraints = (d, x, y) => {
    const xMin = width * 0.18 + d.radius; // 300px / 1920px
    const xMax = width - 50 - d.radius;
    const yMinRatio = currentTopics < 8 ? 0.25 : 0.13;
    const yMin = height * yMinRatio + d.radius;
    const yMax = height * 0.75 - d.radius;

    const constrainedX = Math.max(xMin, Math.min(xMax, x));
    const constrainedY = Math.max(yMin, Math.min(yMax, y));

    return { x: constrainedX, y: constrainedY };
  };

  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.1).restart(); // Reduced alpha for faster response
    const constrained = applyBoundaryConstraints(d, event.x, event.y);
    d.fx = constrained.x;
    d.fy = constrained.y;
    // Also update target positions to prevent conflict with target forces
    d.targetX = constrained.x;
    d.targetY = constrained.y;
  }

  function dragged(event, d) {
    const constrained = applyBoundaryConstraints(d, event.x, event.y);
    d.fx = constrained.x;
    d.fy = constrained.y;
    // Update target positions during drag
    d.targetX = constrained.x;
    d.targetY = constrained.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0.01); // Small alpha to settle quickly
    d.fx = null;
    d.fy = null;
    // Keep the target positions at the final drag position with boundary constraints
    const constrained = applyBoundaryConstraints(d, d.x, d.y);
    d.targetX = constrained.x;
    d.targetY = constrained.y;
  }

  let isInit = true;

  function stepZoom(step) {
    if (step === undefined) {
      resetZoom();
      isInit = false;
      return;
    }

    let id = null;
    for (let i = 0; i < steps.length; i++) {
      let { cluster_id, start_step, end_step } = steps[i];

      if (step >= start_step && step <= end_step) {
        id = cluster_id;
      }
    }
    if (id !== null) {
      for (let i = 0; i < circles.length; i++) {
        if (circles[i].id === id) {
          return {
            x: circles[i].x,
            y: circles[i].y,
            scale: (height * 0.7) / (2 * circles[i].radius + 120) / 1.5, // 1.8 is the zoom factor
          };
        }
      }
    }
    return { x: width / 2, y: height / 2, scale: 1 };
  }

  $: {
    const translation = stepZoom(step);
    if (translation) {
      const { x, y, scale } = translation;
      const responsiveX = -x * scale + width * 0.81;
      const responsiveY = -y * scale + height * 0.55;
      d3.select("#visBack g")
        .transition()
        .duration(800)
        .attr(
          "transform",
          `translate(${responsiveX}, ${responsiveY}) scale(${scale})`
        );
    }
  }

  const jumpToItem = (index) => {
    if (items[index]) {
      items[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  };

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScroll() {
    showButton = window.scrollY > 110;
  }
</script>

<YearColor
  {years}
  {stats}
  {articles}
  {currentArticles}
  {currentFacts}
  {filteredYearArticleCount}
  bind:yearColors
/>

<!-- Relevance Filter in Top Right Corner -->
{#if !showButton}
  <div
    class="fixed top-[100px] left-[10px] z-[1002] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[300px] pl-[40px] pr-[40px]"
  >
    <RelevanceFilter
      {currentTopics}
      {maxTopics}
      {shared_articles}
      {showFactCircles}
      bind:connectedArticlesLimit={sharedArticleLimit}
      on:relevanceChange={handleRelevanceChange}
      on:limitChange={(event) => (sharedArticleLimit = event.detail.limit)}
      on:factsChange={(event) =>
        (showFactCircles = event.detail.showFactCircles)}
    />
  </div>
{/if}

<svg id="visBack" {width} {height} on:click={handleSvgClick}>
  <g>
    <Belt
      {width}
      {height}
      {circles}
      {clusters}
      {shared_articles}
      {yearColors}
      {curMergedId}
      {articlesDict}
      limit={sharedArticleLimit}
      {visibleClusterIds}
      {visibleClusters}
      isVisible={beltsVisible}
    />
    <!-- Collision radius circles (debug visualization) -->
    {#if showCollisionRadius}
      {#each circles as circle (circle.id)}
        {#if visibleClusterIds.has(circle.id)}
          <circle
            cx={circle.x}
            cy={circle.y}
            r={collisionRadius}
            fill="none"
            stroke="rgba(255, 0, 0, 0.3)"
            stroke-width="2"
            stroke-dasharray="5,5"
            pointer-events="none"
          />
        {/if}
      {/each}
    {/if}

    {#each clusters as cluster (cluster.cluster_id)}
      <Circle
        {width}
        {height}
        {cluster}
        {circles}
        {stats}
        {yearColors}
        {currentArticles}
        {currentFacts}
        action={circleAction}
        {curMergedId}
        {articlesDict}
        showFacts={showFactCircles}
        isVisible={visibleClusterIds.has(cluster.cluster_id)}
        on:circleClick={handleCircleClick}
      />
    {/each}
  </g>
</svg>

<div
  class="fixed bottom-4 z-[1001] right-12 transform -translate-y-1/2"
  class:hidden={!showButton}
>
  <button
    on:click={scrollToTop}
    class="text-gray-900 dark:text-white text-1xl p-2 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 relative z-50"
  >
    ↑
  </button>
</div>

<Articles {articles} {yearColors} />
