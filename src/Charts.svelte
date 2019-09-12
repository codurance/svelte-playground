<script>
  import Card from "./Card.svelte";
  import ABSMap from "./charts/ABSMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
  import GridView from "./charts/GridView.svelte";
  import List from "./charts/List.svelte";
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import { LensSelected } from "./store.js";

  export let mixSelected = false;
</script>

{#if $LensSelected == "map"}
<Card svgElementId="map" fileName="ABS Barcelona Map">
  <ABSMap mixSelected={mixSelected} />
  <span slot="aditionalFilter">
    <FormField>
      <Checkbox bind:checked={mixSelected} />
      <span slot="label">Homes y Dones</span>
    </FormField>
  </span>
</Card>
{:else if $LensSelected == "barchart"}
  <Card svgElementId="barchart">
    <Barchart />
  </Card>
{:else if $LensSelected == "grid"}
  <GridView />
{:else if $LensSelected == "list"}
  <List />
{/if}
