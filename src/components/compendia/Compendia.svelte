<script>
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
  import Popup from "$components/compendia/Popup.svelte";
  import Section from "$components/compendia/Section.svelte";
  import Country from "$components/compendia/Country.svelte";
  import TagsSection from "$components/compendia/TagsSection.svelte";
  import ModernSearchBox from "$components/compendia/ModernSearchBox.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  import homeschool2 from "$data/samples/Is_homeschooling_preferred_by_people-2.json";
  import toktokTrends from "$data/samples/Tiktok_trends_worldwide-2.json";
  import cancer from "$data/samples/Global_cancer_patients_burden.json";
  import AIjobs from "$data/samples/Does_AI_leading_to_new_jobs_or_job_displacements.json";
  export let searchQuery = "";
  export let isSticky = false;
  export let isLoading = false;
  export let isPopupOpen = false;
  export let web = "";
  export let resultsCountPerPage = 8;
  export let isDataLoading = false;
  export let clusterData = {};
  export let clusters = [];
  export let sharedArticles = [];
  export let sharedFacts = [];
  export let stats = {};
  export let errorMessage = null;

  // Track if search is in progress
  let searchInProgress = false;
  let currentAbortController = null;

  export let viewportHeight;
  export let viewportWidth;

  let countryCode;
  let articlesLimit = 0;
  let showFacts = true;
  let relevanceOptions = { low: false, medium: true, high: false };
  let clusterLimit = 0;

  let isRelevanceEnabled = false;
  let isClusterLimitEnabled = false;

  let originalData;

  let showRecentStories = false;
  let showSampleStories = false;

  const ranges = {
    low: { min: 0, max: 0.33 },
    medium: { min: 0.34, max: 0.66 },
    high: { min: 0.67, max: 1.0 },
  };

  // Initialize from localStorage

  const exampleQueries = [
    {
      query: "Is homeschooling preferred by people?",
      data: homeschool2,
    },
    {
      query: "Tiktok trends worldwide",
      data: toktokTrends,
    },
    {
      query: "Global cancer patients burden",
      data: cancer,
    },
    {
      query: "Does AI leading to new jobs or job displacements?",
      data: AIjobs,
    }
  ];

  let recentResults = []; // Store full result objects with IDs

  // Fetch recent results from API
  const fetchRecentResults = async () => {
    try {
      const apiBaseUrl = PUBLIC_API_BASE_URL || "http://localhost:8000";

      console.log("api base", apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/recent`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Store full results and extract queries for display
        recentResults = data.results
          .filter((result) => result.is_completed)
          .slice(0, 20); // Limit to 10 most recent
      }
    } catch (error) {
      console.error("Failed to fetch recent results:", error);
      recentResults = [];
    }
  };

  // Load recent data by ID
  const loadRecentData = async (selectedResult) => {
    searchQuery = selectedResult.query;
    isSticky = true;
    isLoading = true;
    resetState();

    try {
      const apiBaseUrl = PUBLIC_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiBaseUrl}/results/${selectedResult.id}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(`Duplicate Request: ${errorData.detail}`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const recentData = result.data;

      validateDataStructure(recentData);
      loadFilterData();

      const dataCopy = JSON.parse(JSON.stringify(recentData));
      originalData = dataCopy;

      setTimeout(() => {
        clusterData = recentData;
        clusters = recentData.clusters;
        sharedArticles = recentData.shared_articles;
        sharedFacts = recentData.shared_facts;
        stats = recentData.stats;

        updateState2(clusterData);
        if (isRelevanceEnabled) {
          filter_cluster_on_relevance(relevanceOptions);
        }
        if (isClusterLimitEnabled) {
          filter_cluster_on_cluster_limit(clusterLimit);
        }
        isDataLoading = true;
        isLoading = false;
      }, 500);
    } catch (error) {
      console.error("Failed to load recent data:", error);
      errorMessage = `Failed to load recent result: ${error.message}`;
      isLoading = false;
    }
  };

  const togglePopup = () => {
    isPopupOpen = !isPopupOpen;
  };

  // Add beforeunload warning when search is in progress
  onMount(() => {
    const handleBeforeUnload = (event) => {
      if (searchInProgress) {
        event.preventDefault();
        event.returnValue =
          "Your search is still in progress. Are you sure you want to leave?";
        return event.returnValue;
      }
    };

    if (browser) {
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Fetch recent results when component mounts
      fetchRecentResults();

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        // Cancel any ongoing requests when component is destroyed
        if (currentAbortController) {
          currentAbortController.abort();
        }
      };
    }
  });

  const handlePopupSubmit = (web_, resultsCountPerPage_) => {
    web = web_;
    resultsCountPerPage = resultsCountPerPage_;
    isPopupOpen = false;
  };

  const validateDataStructure = (data) => {
    if (!data || !data.clusters || !data.stats) {
      throw new Error("Invalid data structure received from API");
    }
  };

  const resetState = () => {
    clusterData = {};
    clusters = [];
    sharedArticles = [];
    sharedFacts = [];
    stats = {};
    isDataLoading = false;
    errorMessage = null;
  };

  const stepHandler = (step) => {
    return step;
  };

  // Get data from the API
  const handleSearch = async (e) => {
    e.preventDefault();

    // Prevent duplicate requests
    if (searchInProgress) {
      console.log("Search already in progress, ignoring duplicate request");
      return;
    }

    // Cancel any existing request
    if (currentAbortController) {
      currentAbortController.abort();
    }

    // Create new AbortController for this request
    currentAbortController = new AbortController();

    isSticky = true;
    isLoading = true;
    searchInProgress = true;
    resetState();

    try {
      const apiBaseUrl = PUBLIC_API_BASE_URL || "http://localhost:8000";

      const response = await fetch(
        `${apiBaseUrl}/stories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            query: searchQuery,
            web: web,
            result_count_per_page: resultsCountPerPage,
            country_code: countryCode,
            num_pages: 2
          }),
          signal: currentAbortController.signal
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      validateDataStructure(data);

      loadFilterData();

      // Update all reactive states
      const dataCopy = JSON.parse(JSON.stringify(data));
      originalData = dataCopy;
      clusterData = data;
      clusters = data.clusters;
      sharedArticles = data.shared_articles;
      sharedFacts = data.shared_facts;
      stats = data.stats;

      updateState2(clusterData);
      if (isRelevanceEnabled) {
        filter_cluster_on_relevance(relevanceOptions);
      }
      if (isClusterLimitEnabled) {
        filter_cluster_on_cluster_limit(clusterLimit);
      }

      isDataLoading = true;
    } catch (error) {
      // Handle AbortError separately
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error("Fetch Error:", error);

      // Provide more helpful error messages
      if (error.message.includes("Duplicate Request")) {
        errorMessage = error.message.replace("Duplicate Request: ", "");
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage = `Unable to connect to the API server. Please check if the backend is running at ${apiBaseUrl} or update your VITE_API_BASE_URL environment variable.`;
      } else if (error.message.includes("Unexpected token")) {
        errorMessage = `The API server returned an invalid response. This usually means the server is down or returning an error page instead of JSON data.`;
      } else {
        errorMessage = `API Error: ${error.message}`;
      }
    } finally {
      isLoading = false;
      searchInProgress = false;
      currentAbortController = null;
    }
  };

  const loadFilterData = () => {
    const storedFilters = localStorage.getItem("compendiaFilters");
    if (storedFilters) {
      const filters = JSON.parse(storedFilters);
      articlesLimit = filters.connectedArticlesLimit || 0;
      showFacts = filters.showFacts ?? true;
      relevanceOptions = filters.relevanceOptions || {
        low: true,
        medium: true,
        high: true,
      };
    }
  };

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const loadExampleData = async (selectedExample) => {
    searchQuery = selectedExample.query;
    isSticky = true;
    isLoading = true;
    resetState();
    try {
      const exampleData = selectedExample.data;
      validateDataStructure(exampleData);
      loadFilterData();

      const dataCopy = JSON.parse(JSON.stringify(exampleData));
      originalData = dataCopy;

      setTimeout(() => {
        clusterData = exampleData;
        clusters = exampleData.clusters;
        sharedArticles = exampleData.shared_articles;
        sharedFacts = exampleData.shared_facts;
        stats = exampleData.stats;

        updateState2(clusterData);
        if (isRelevanceEnabled) {
          filter_cluster_on_relevance(relevanceOptions);
        }
        if (isClusterLimitEnabled) {
          filter_cluster_on_cluster_limit(clusterLimit);
        }
        isDataLoading = true;
        isLoading = false;
      }, 500);
    } catch (error) {
      errorMessage = `Failed to load example: ${error.message}`;
      isLoading = false;
    }
  };

  const filter_cluster_on_cluster_limit = (filter) => {
    // Make a deep copy of the original clusters
    let newClusterData = JSON.parse(JSON.stringify(originalData.clusters));

    // Sort clusters by similarity score in descending order
    newClusterData.sort(
      (a, b) => b.cluster_similarity_score - a.cluster_similarity_score
    );

    let newClusterIds = new Set();

    // Apply cluster limit if specified
    if (filter >= 0) {
      newClusterData = newClusterData.slice(0, filter);
    }

    newClusterData.forEach((cluster) => {
      newClusterIds.add(cluster.cluster_id);
    });

    let filteredClusters = [];

    originalData.clusters.forEach((cluster) => {
      if (newClusterIds.has(cluster.cluster_id)) {
        filteredClusters.push(cluster);
      }
    });

    // Create a new object to trigger reactivity
    clusterData = {
      ...clusterData,
      clusters: filteredClusters,
    };
    updateStats(clusterData);
  };

  const filter_cluster_on_relevance = (filter) => {
    let newClusterData = [];

    originalData.clusters.forEach((cluster) => {
      if (
        filter.low &&
        cluster.cluster_similarity_score >= ranges.low.min &&
        cluster.cluster_similarity_score <= ranges.low.max
      ) {
        newClusterData.push(cluster);
      }
      if (
        filter.medium &&
        cluster.cluster_similarity_score >= ranges.medium.min &&
        cluster.cluster_similarity_score <= ranges.medium.max
      ) {
        newClusterData.push(cluster);
      }
      if (
        filter.high &&
        cluster.cluster_similarity_score >= ranges.high.min &&
        cluster.cluster_similarity_score <= ranges.high.max
      ) {
        newClusterData.push(cluster);
      }
    });

    // Create a new object to trigger reactivity
    clusterData = {
      ...clusterData,
      clusters: newClusterData,
    };
    updateStats(clusterData);
  };

  const updateState2 = (clusterData) => {
    // Make a deep copy of the original clusters
    let newClusterData = JSON.parse(JSON.stringify(originalData.clusters));
    let newMergedData = JSON.parse(
      JSON.stringify(originalData.all_merged_facts_in_order)
    );

    // Sort clusters by similarity score in descending order
    newClusterData.sort(
      (a, b) => b.cluster_similarity_score - a.cluster_similarity_score
    );

    let newClusterIds = new Set();

    newClusterData.forEach((cluster) => {
      newClusterIds.add(cluster.cluster_id);
    });

    let step = {
      cluster_id: 0,
      start_step: 0,
      end_step: -1,
    };
    let newSteps = [];
    let newFactOrder = [];
    let orderId = 0;

    newClusterData.forEach((cluster) => {
      step.cluster_id = cluster.cluster_id;
      step.start_step = step.end_step + 1;
      step.end_step += cluster.number_of_merged_facts;
      newSteps.push(JSON.parse(JSON.stringify(step)));
    });

    newClusterIds.forEach((clusterId) => {
      newMergedData.forEach((merged_fact_data) => {
        const mergedId = parseInt(merged_fact_data.merged_id.split("_")[0]);
        if (mergedId == clusterId) {
          orderId += 1;
          merged_fact_data.order_id = orderId;
          newFactOrder.push(merged_fact_data);
        }
      });
    });

    clusterData.steps = newSteps;
    clusterData.all_merged_facts_in_order = newFactOrder;
  };

  const updateStats = (clusterData) => {
    let uniqueIds = new Set();
    let clusterIds = new Set();
    let totalFacts = 0;
    let articleMap = [];
    let mergedFactsInOrder = [];
    let step = {
      cluster_id: 0,
      start_step: 0,
      end_step: -1,
    };
    let newSteps = [];

    clusterData.clusters.forEach((cluster) => {
      clusterIds.add(cluster.cluster_id);
      cluster.articles.forEach((article) => {
        uniqueIds.add(article.id);
      });

      step.cluster_id = cluster.cluster_id;
      step.start_step = step.end_step + 1;
      step.end_step += cluster.number_of_merged_facts;
      newSteps.push(JSON.parse(JSON.stringify(step)));

      totalFacts += cluster.all_original_facts.length;
    });

    originalData.all_mapped_articles.forEach((article) => {
      if (uniqueIds.has(article.id)) {
        articleMap.push(article);
      }
    });

    originalData.all_merged_facts_in_order.forEach((merged_fact) => {
      const clusterId = parseInt(merged_fact.merged_id.split("_")[0]);
      if (clusterIds.has(clusterId)) {
        mergedFactsInOrder.push(merged_fact);
      }
    });

    clusterData.stats.total_articles = uniqueIds.size;
    clusterData.stats.total_original_facts = totalFacts;
    clusterData.all_merged_facts_in_order = mergedFactsInOrder;
    clusterData.all_mapped_articles = articleMap;
    clusterData.steps = newSteps;
  };
</script>

<div class={isSticky ? "" : "mainPage"}>
  {#if isSticky}
    <!-- Sticky version - modern design with integrated search icon -->
    <form
      on:submit={handleSearch}
      class="bg-white dark:bg-[#1a2e3c] stickyForm"
    >
      <img
        src="/assets/compendia/compendia-2.svg"
        class="stickyLogo"
        alt="compendia logo"
        on:click={() => location.reload()}
        style="cursor: pointer;"
      />
      <div class="stickySearchContainer">
        <div class="stickySearchWrapper">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search on Compendia..."
            class="stickySearchInput"
          />
          <div class="stickySearchActions">
            {#if !isLoading}
              <button
                type="button"
                class="stickyOptionsButton"
                on:click={togglePopup}
                aria-label="Options"
              >
                <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor">
                  <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-1 13.5l103 78-110 190-119-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 41q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 65q-5 14-7 29.5t-2 31.5q0 16 2 31.5t7 29.5l-86 65 39 68 99-41q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
                </svg>
              </button>
            {/if}
            <button
              type="submit"
              class="stickySearchButton"
              disabled={isLoading}
              aria-label="Search"
            >
              {#if isLoading}
                <div class="stickySpinner"></div>
              {:else}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </form>
  {:else}
    <!-- Non-sticky version - use modern search box -->
    <div class="modern-search-wrapper">
      <img
        src="/assets/compendia/compendia-2.svg"
        class="logo"
        alt="compendia logo"
        style="cursor: pointer;"
      />

      <ModernSearchBox
        bind:searchQuery
        bind:showSampleStories
        bind:showRecentStories
        {isLoading}
        onSearch={handleSearch}
        onOptionsClick={togglePopup}
      />

      <!-- Tags section for non-sticky mode only -->
      <div
        class="flex pt-4 flex-wrap gap-4 mt-5 justify-center overflow-x-auto w-[766px]"
      >
        <!-- Recent box - only show if there are recent queries -->
        {#if recentResults.length > 0 && showRecentStories}
          <TagsSection
            queries={recentResults}
            title="Recent Stories"
            colorScheme="green"
            handleSearch={loadRecentData}
          />
        {/if}

        <!-- Samples box -->
        {#if exampleQueries.length > 0 && showSampleStories}
          <TagsSection
            queries={exampleQueries}
            title="Sample stories"
            colorScheme="blue"
            handleSearch={loadExampleData}
          />
        {/if}
      </div>
    </div>
  {/if}

  {#if errorMessage}
    <div
      class="fixed inset-0 bg-red-100/90 flex flex-col items-center justify-center z-50 p-4"
    >
      <div class="bg-red-500 text-white p-6 rounded-lg max-w-2xl text-center">
        <h2 class="text-2xl font-bold mb-4">Error Loading Data</h2>
        <p class="mb-4">{errorMessage}</p>
        <button
          class="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors"
          on:click={() => (errorMessage = null)}
        >
          Try Again
        </button>
      </div>
    </div>
  {:else if isLoading}
    <div class="lottie-container">
      <DotLottieSvelte src="/assets/compendia/searching.lottie" loop autoplay />
    </div>
  {/if}

  {#if isPopupOpen}
    <Popup {web} {resultsCountPerPage} {togglePopup} {handlePopupSubmit} />
  {/if}

  {#if isDataLoading && !isLoading}
    <Section {viewportHeight} {viewportWidth} {clusterData} {stepHandler} />
  {/if}
</div>

<Country bind:countryCode></Country>

<footer
  class="fixed bottom-0 w-full text-black bg-white dark:bg-[var(--footer-bg)] dark:text-[var(--footer-text)] text-center py-2 text-sm cursor-none"
>
  Compendia can make mistakes. Check important info.
</footer>

<style>
  .lottie-container {
    width: 100vw;
    height: 100vh;
    top: 100px;
  }

  .logo {
    height: 10em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em var(--color-primary-alpha));
  }

  .stickyLogo {
    /* margin-bottom: 40px; */
    margin-left: 40px;
    margin-right: 20px;
    width: 120px;
    height: 50px;
  }

  .modern-search-wrapper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .stickyForm {
    position: fixed;
    top: 0; /* Stick to the top */
    left: 0;
    right: 0;
    z-index: 3; /* Ensure it stays above other content */
    width: 100%;
    /* max-width: 584px; */
    margin: 0 auto;
    display: flex;
    flex-direction: raw;
    align-items: center;
    padding: 20px 0; /* Add some padding */
    box-shadow: 0 2px 5px var(--color-shadow); /* Optional shadow */
  }

  .stickySearchContainer {
    flex: 1;
    max-width: 800px;
    margin: 0 20px;
  }

  .stickySearchWrapper {
    position: relative;
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    background: white;
    display: flex;
    align-items: center;
    transition: border-color 0.2s ease;
  }

  :global(.dark) .stickySearchWrapper {
    border-color: #374151;
    background: #1f2937;
  }

  .stickySearchWrapper:hover {
    border-color: #d1d5db;
  }

  :global(.dark) .stickySearchWrapper:hover {
    border-color: #4b5563;
  }

  .stickySearchWrapper:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .stickySearchInput {
    flex: 1;
    padding: 10px 16px;
    font-size: 16px;
    border: none;
    outline: none;
    background: transparent;
    color: #111827;
    line-height: 1.5;
    min-height: 24px;
  }

  :global(.dark) .stickySearchInput {
    color: #f9fafb;
  }

  .stickySearchInput::placeholder {
    color: #6b7280;
  }

  :global(.dark) .stickySearchInput::placeholder {
    color: #9ca3af;
  }

  .stickySearchActions {
    display: flex;
    align-items: center;
    gap: 0px;
    padding-right: 8px;
  }

  .stickyOptionsButton {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.dark) .stickyOptionsButton {
    color: #9ca3af;
  }

  .stickyOptionsButton:hover {
    background: #f3f4f6;
    color: #374151;
  }

  :global(.dark) .stickyOptionsButton:hover {
    background: #374151;
    color: #d1d5db;
  }

  .stickySearchButton {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.dark) .stickySearchButton {
    color: #9ca3af;
  }

  .stickySearchButton:hover:not(:disabled) {
    background: #f3f4f6;
    color: #374151;
  }

  :global(.dark) .stickySearchButton:hover:not(:disabled) {
    background: #374151;
    color: #d1d5db;
  }

  .stickySearchButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stickySpinner {
    width: 16px;
    height: 16px;
    border: 2px solid #d1d5db;
    border-top: 2px solid #6b7280;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  :global(.dark) .stickySpinner {
    border-color: #4b5563;
    border-top-color: #9ca3af;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .mainPage {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    flex-wrap: nowrap;
    min-height: 100vh;
  }


</style>
