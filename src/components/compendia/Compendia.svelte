<script>
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
  import Popup from "$components/compendia/Popup.svelte";
  import Section from "$components/compendia/Section.svelte";
  import Country from "$components/compendia/Country.svelte";
  import TagsSection from "$components/compendia/TagsSection.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { PUBLIC_API_BASE_URL } from '$env/static/public'; 


  import homeschool2 from "$data/samples/Is_homeschooling_preferred_by_people-2.json";
  import toktokTrends from "$data/samples/Tiktok_trends_worldwide-2.json";
  import tesla from "$data/samples/what_happens_to_tesla_stocks.json";
  import cancer from "$data/samples/Global_cancer_patients_burden.json";
  import stockprice from "$data/samples/Stock_market_price_fluctuation.json";
  import AIjobs from "$data/samples/Does_AI_leading_to_new_jobs_or_job_displacements.json";
  import gold_price from "$data/samples/gold_price.json";
  import how_was_tesla_performing_in_2025 from "$data/samples/how_was_tesla_performing_in_2025.json";


  export let searchQuery = "";
  export let isSticky = false;
  export let isLoading = false;
  export let isPopupOpen = false;
  export let web = "";
  export let resultsCountPerPage = 4;
  export let isDataLoading = false;
  export let clusterData = {};
  export let clusters = [];
  export let sharedArticles = [];
  export let sharedFacts = [];
  export let stats = {};
  export let errorMessage = null;
  
  // Track if search is in progress
  let searchInProgress = false;

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
      query: "Stock market price fluctuation",
      data: stockprice,
    },
    {
      query: "Does AI leading to new jobs or job displacements?",
      data: AIjobs,
    },
    {
      query: "Gold prices predictions by different firms",
      data: gold_price,
    },
    {
      query: "How was the tesla performing in 2025",
      data: how_was_tesla_performing_in_2025,
    },
    {
      query: "What happens to Tesla stocks?",
      data: tesla,
    },
  ];

  let recentResults = []; // Store full result objects with IDs
  
  // Fetch recent results from API
  const fetchRecentResults = async () => {
    try {
      const apiBaseUrl = PUBLIC_API_BASE_URL || "http://localhost:8000";

      console.log('api base', apiBaseUrl)
      const response = await fetch(`${apiBaseUrl}/recent`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store full results and extract queries for display
        recentResults = data.results
          .filter(result => result.is_completed)
          .slice(0, 10); // Limit to 10 most recent
        
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
      const response = await fetch(`${apiBaseUrl}/results/${selectedResult.id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        }
      });
      
      if (!response.ok) {
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
        event.returnValue = 'Your search is still in progress. Are you sure you want to leave?';
        return event.returnValue;
      }
    };
    
    if (browser) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Fetch recent results when component mounts
      fetchRecentResults();
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
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
    
    isSticky = true;
    isLoading = true;
    searchInProgress = true;
    resetState();

    try {
      const apiBaseUrl = PUBLIC_API_BASE_URL || "http://localhost:8000";
      
      const response = await fetch(
        `${apiBaseUrl}/stories?query=${encodeURIComponent(
          searchQuery
        )}&web=${encodeURIComponent(
          web
        )}&result_count_per_page=${resultsCountPerPage}&country_code=${countryCode}&num_pages=2`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          }
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
      console.error("Fetch Error:", error);

      // Provide more helpful error messages
      if (
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
  <form
    on:submit={handleSearch}
    class="bg-white dark:bg-[#1a2e3c] {isSticky ? 'stickyForm' : 'form'}"
  >
    <img
      src="/assets/compendia/compendia-2.svg"
      class={isSticky ? "stickyLogo" : "logo"}
      alt="compendia logo"
      on:click={() => (isSticky ? location.reload() : null)}
      style="cursor: pointer;"
    />
    <div class={isSticky ? "stickyInputContainer" : "inputContainer"}>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search on Compendia..."
        class="input text-black"
      />
      {#if isLoading}
        <img
          src="/assets/compendia/loader.svg"
          class="loadersvg"
          alt="Loading..."
        />
      {:else}
        <img
          src="/assets/compendia/options.svg"
          class="options color-primary"
          alt="Options"
          on:click={togglePopup}
        />
      {/if}
    </div>
    <div class={isSticky ? "stickyButtonContainer" : "buttonContainer"}>
      <button type="submit" class={isSticky ? "stickyButton" : "button"}>
        Search
      </button>
    </div>
    
    {#if !isSticky}
      <!-- Tags section for non-sticky mode only -->
       <div class="flex pt-4 flex-wrap gap-4 mt-5 justify-center overflow-x-auto">

        <!-- Recent box - only show if there are recent queries -->
         {#if recentResults.length > 0}
           <TagsSection 
             queries={recentResults}
             title="Recent Stories"
             colorScheme="green"
             handleSearch={loadRecentData} 
           />
         {/if}

         <!-- Samples box -->
          <TagsSection 
             queries={exampleQueries}
           title="Samples stories"
           colorScheme="blue"
           handleSearch={loadExampleData} 
           />
        </div>

    {/if}
  </form>

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

  .lottie-animation {
    width: 100vw;
    height: 100vh;
  }

  .logo {
    height: 8em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em var(--color-primary-alpha));
  }

  .stickyLogo {
    /* margin-bottom: 40px; */
    margin-left: 20px;
    margin-right: 20px;
    width: 100px;
    height: 50px;
  }

  .form {
    width: 100%;
    max-width: 584px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .inputContainer {
    width: 100%;
    display: flex;
  }

  .stickyInputContainer {
    width: 60%;
    display: flex;
    margin-left: 20px;
    margin-right: 20px;
  }

  .input {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    border: 1px solid var(--color-input-border);
    border-radius: 24px;
    box-shadow: none;
    outline: none;
    transition:
      box-shadow 0.3s,
      border-color 0.3s;
    text-overflow: ellipsis;
  }

  .buttonContainer {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .stickyButtonContainer {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    /* margin-left: 20px; */
  }

  .button {
    padding: 10px 24px;
    font-size: 14px;
    background-color: var(--color-button-bg);
    color: var(--color-button-text);
    border: 1px solid var(--color-button-bg);
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
  }

  .stickyButton {
    padding: 10px 24px;
    font-size: 14px;
    background-color: var(--color-button-bg);
    color: var(--color-button-text);
    border: 1px solid var(--color-button-bg);
    border-radius: 4px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
  }

  .stickyButton:hover {
    background-color: #e0e0e0;
  }

  .mainPage {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    flex-wrap: nowrap;
    min-height: 100vh;
  }

  .loadersvg {
    width: 35px;
    height: 35px;
    margin-top: 5px;
    margin-left: -50px;
    position: relative;
  }

  .options {
    width: 22px;
    height: 22px;
    margin-top: 11px;
    margin-left: -35px;
    position: relative;
    cursor: pointer;
  }
</style>
