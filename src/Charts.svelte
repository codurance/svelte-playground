<script>
  import Card from "./Card.svelte";
  import ABSMap from "./charts/ABSMap.svelte";
  import DeckGLMap from "./charts/DeckGLMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
  import GridView from "./charts/GridView.svelte";
  import List from "./charts/List.svelte";
  import { LensSelected } from "./store.js";
</script>

{#if $LensSelected == 'map'}
  <Card svgElementId="map" fileName="ABS Barcelona Map">
    <ABSMap />
  </Card>
{:else if $LensSelected == 'absDeck'}
  <DeckGLMap />
{:else if $LensSelected == 'barchart'}
  <Card svgElementId="barchart">
    <Barchart />
  </Card>
{:else if $LensSelected == 'grid'}
  <GridView />
{:else if $LensSelected == 'list'}
  <List />
{/if}
