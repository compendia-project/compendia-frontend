<script>
  import "$styles/app.css";
  import { theme } from "$stores/store.js";
</script>

<main id="content" class={$theme}>
  <slot />
</main>
