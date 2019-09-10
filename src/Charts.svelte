<script>
  import Card from "./Card.svelte";
  import ABSMap from "./charts/ABSMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  export let mixSelected = false;
</script>

<Card svgElementId="map" fileName="ABS Barcelona Map">
  <ABSMap mixSelected={mixSelected} />
  <span slot="aditionalFilter">
    <FormField>
      <Checkbox bind:checked={mixSelected} />
      <span slot="label">Homes - Dones</span>
    </FormField>
  </span>
</Card>
<br />
<Card svgElementId="barchart">
  <Barchart />
</Card>
