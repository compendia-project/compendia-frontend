<script>
  import FactScroll from "$components/compendia/FactScroll.svelte";
  import Overview from "$components/compendia/Overview.svelte";

  export let viewportHeight;
  export let viewportWidth;
  export let stepHandler;
  export let clusterData;

  let clusters = [];
  let sharedArticles = [];
  let sharedFacts = [];
  let stats = {};
  let allFacts = [];
  let items = [];
  let currentTopics = 6;

  let value;
  let newValues;
  let step;
  let curMergedId;
  let visibleClusterIds;

  clusters = clusterData["clusters"];
  sharedArticles = clusterData["shared_articles"];
  sharedFacts = clusterData["shared_facts"];
  stats = clusterData["stats"];
  allFacts = clusterData["all_merged_facts_in_order"];

  let filteredFacts = JSON.parse(JSON.stringify(clusterData["all_merged_facts_in_order"]));
  let originalAllFacts = JSON.parse(JSON.stringify(clusterData["all_merged_facts_in_order"]));
  let articles = clusterData["all_mapped_articles"];
  let articlesDict = Object.fromEntries(
    articles.map((item) => [item.id, item])
  );

    // Initialize filteredFacts with first three topics on component mount
  const initializeFilteredFacts = () => {
    const sortedClusters = [...clusters].sort(
      (a, b) => (b.cluster_similarity_score || 0) - (a.cluster_similarity_score || 0)
    );
    const firstThreeClusterIds = sortedClusters.slice(0, currentTopics).map(c => c.cluster_id);
    
    filteredFacts = originalAllFacts.filter((fact) => {
      return firstThreeClusterIds.includes(parseInt(fact['merged_id'].split('_')[0]));
    });

  };
  

  initializeFilteredFacts();

  // let stepCounts = [];
  let total = -1;

  const getSteps = (visibleClusterIds = null) => {
    total = -1;
    const clustersToProcess = visibleClusterIds 
      ? clusters.filter(cluster => visibleClusterIds.includes(cluster.cluster_id))
      : clusters;
    
    clustersToProcess.forEach((cluster) => {
      const numFacts = cluster.number_of_facts;
      total += numFacts;
    });
  };

  getSteps();

  $: value, handleStepChange();

  function handleStepChange() {
    if (step == 0 && value == undefined) {
      step = undefined;
    } else if (step === total && value === undefined) {
      step = total;
    } else {
      step = value;
    }
    newValues = stepHandler(step);
  }

  function handleFactChange(newValue) {
    if (filteredFacts === undefined) return;
    value = newValue;
    const currentFact = filteredFacts[value];
    curMergedId = undefined;
    if (currentFact) {
      curMergedId = currentFact.merged_id;
    }
  }

  function handleVisibleClustersChange(event) {
 
    currentTopics = event.detail.currentTopics;
    visibleClusterIds = event.detail.visibleClusterIds;

    filteredFacts = JSON.parse(JSON.stringify(originalAllFacts));

    filteredFacts = filteredFacts.filter((fact) => {
      return visibleClusterIds.includes(parseInt(fact['merged_id'].split('_')[0]));
    });
    
    // Recalculate total based on visible clusters
    getSteps(visibleClusterIds);
    
    // Reset the value to 0 when facts are filtered to ensure proper active state
    value = 0;
    step = 0;
    
    // Clear items array to reset DOM element references
    items = [];
  }

</script>

<div class="scroll-section matt-scroll">
  <div class="sticky" style="max-height:{viewportHeight}px;">
    <Overview
      bind:value
      data={clusterData}
      {viewportHeight}
      {viewportWidth}
      {step}
      {curMergedId}
      {items}
      on:visibleClustersChange={handleVisibleClustersChange}
    ></Overview>
  </div>

  <div class="steps">
    {#key filteredFacts.length}
      <FactScroll
        bind:value
        {items}
        facts={filteredFacts}
        {articlesDict}
        onFactChange={handleFactChange}
      />
    {/key}
  </div>
</div>

<style>
  .sticky {
    position: sticky;
    z-index: 1;
    display: flex;
    justify-content: center;
    top: 100px;
  }
  .steps {
    position: relative;
    z-index: 2;
    max-width: 2000px;
    padding: 16px;
    margin: 0 auto;
    pointer-events: none;
  }
</style>
