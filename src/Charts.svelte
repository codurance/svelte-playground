<script>
  import Card from "./Card.svelte";
  import ABSMap from "./charts/ABSMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
</script>

<Card svgElementId="map">
  <ABSMap />
</Card>
<br />
<Card svgElementId="barchart">
  <Barchart />
</Card>
