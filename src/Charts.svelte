<script>
  import ABSMap from "./charts/ABSMap.svelte";
  import DeckGLMap from "./charts/DeckGLMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
  import GridView from "./charts/GridView.svelte";
  import List from "./charts/List.svelte";
  import { LensSelected } from "./store.js";
</script>

{#if $LensSelected == 'map'}
  <ABSMap />
{:else if $LensSelected == 'absDeck'}
  <DeckGLMap />
{:else if $LensSelected == 'barchart'}
  <Barchart />
{:else if $LensSelected == 'grid'}
  <GridView />
{:else if $LensSelected == 'list'}
  <List />
{/if}
