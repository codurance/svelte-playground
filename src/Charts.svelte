<script>
  import Card from "./Card.svelte";
  import ABSMap from "./charts/ABSMap.svelte";
  import Barchart from "./charts/Barchart.svelte";
</script>

<Card svgElementId="map" fileName="ABS Barcelona Map">
  <ABSMap />
</Card>
<br />
<Card svgElementId="barchart">
  <Barchart />
</Card>
