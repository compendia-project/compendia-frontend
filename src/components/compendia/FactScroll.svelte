<script>
  import VisCard from "$components/compendia/VisCard.svelte";
  import Scrolly from "$components/helpers/Scrolly.svelte";
  export let facts;
  export let value = 0;
  export let onFactChange;
  export let items = [];
  export let articlesDict;

  $: value, onFactChange(value);
</script>

<Scrolly bind:value>
  {#each facts as fact, i}
    {@const active = value === i}
    {@const last = i == facts.length - 1 ? true : false}
    {@const first = i == 0 ? true : false}
    <div
      bind:this={items[i]}
      class="vis-card"
      class:active
      class:last
      class:first
    >
      <VisCard {fact} {articlesDict}></VisCard>
    </div>
  {/each}
</Scrolly>

<style>
  .vis-card {
    height: 60vh;
    padding: 0px;
    display: block;
    width: fit-content;
    margin-left: 200px;
    /* margin: 0 auto; */
    opacity: 0.3;
    transition: opacity 300ms ease;
    max-width: 800px;
    z-index: 2;
  }
  .vis-card.active {
    opacity: 1;
  }
  .first {
    margin-top: 20vh;
  }
  .last {
    margin-bottom: 50vh;
  }
</style>
