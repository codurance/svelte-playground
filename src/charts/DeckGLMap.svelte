<script>
  import { onMount, tick } from "svelte";
  import { ABSChartFilter } from "../store.abs.js";
  import { Barcelona3dMap } from "../store.endpoint.js";
  import Card from "../Card.svelte";
  import ABSFilters from "./filters/ABSFilters.svelte";

  const COLOR_SCALE = [
    // negative
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // positive
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ];

  let deckInstance = null;

  onMount(async () => {
    deckInstance = new deck.DeckGL({
      container: "absDeck",
      latitude: 41.39,
      longitude: 2.15,
      zoom: 10.3,
      pitch: 8,
      layers: []
    });
    redraw();
  });

  function colorScale(x) {
    const i = Math.floor(Math.random() * 12) + 1;
    return COLOR_SCALE[i];
  }

  function getElevation(x) {
    console.log($ABSChartFilter);
    if (x > 20000) {
      return (Math.floor(Math.random() * 8) + 1) * 500;
    }
    return parseInt(x) / 4;
  }

  function redraw() {
    const layers = [
      new deck.GeoJsonLayer({
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: true,
        id: "base-map",
        data: Barcelona3dMap,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        getLineDashArray: [3, 3],
        getLineColor: [60, 60, 60],
        getElevation: f =>
          getElevation(($ABSChartFilter + 1) * f.properties.PERIMETRE),
        getFillColor: f => colorScale(f.properties.PERIMETRE),
        updateTriggers: {
          getElevation: f =>
            getElevation(($ABSChartFilter + 1) * f.properties.PERIMETRE),
          getFillColor: f => colorScale(f.properties.PERIMETRE)
        }
      })
    ];

    deckInstance.setProps({ layers });
  }

  ABSChartFilter.subscribe(newValue => {
    if (deckInstance) {
      redraw();
    }
  });
</script>

<Card fileName="ABS Barcelona 3D Map">

  <div slot="filter">
    <ABSFilters />
  </div>

  <div id="absDeck" />

</Card>
