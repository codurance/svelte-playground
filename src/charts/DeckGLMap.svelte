<script>
import { onMount, tick } from 'svelte';
const COUNTRIES = 'https://raw.githubusercontent.com/martgnz/bcn-geodata/master/barris/barris.geojson';
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
function colorScale(x) {
  const i = Math.floor(Math.random() * 10) + 1;
  return COLOR_SCALE[i]
}
function getElevation(x) {
  if (x > 20000) {
    return (Math.floor(Math.random() * 8) + 1) * 500
  }
  return parseInt(x)/4
}

onMount(async ()=> {
  await tick()

  const deckgl = new deck.DeckGL({
    container: 'absDeck',
    latitude: 41.39,
    longitude: 2.15,
    zoom: 11,
    pitch: 20,
    layers: [
      new deck.GeoJsonLayer({
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: true,
        id: 'base-map',
        data: COUNTRIES,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        getLineDashArray: [3, 3],
        getLineColor: [60, 60, 60],
        getFillColor: f => colorScale(f.properties.PERIMETRE),
        getElevation: f => getElevation(f.properties.PERIMETRE)
        })
    ]
  });
})
</script>

<div id="absDeck"></div>
