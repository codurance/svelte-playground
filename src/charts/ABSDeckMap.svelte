<script>
  import { onMount } from "svelte";

  onMount(() => {
    const el = document.createElement("div");
    el.setAttribute("id", "absMapDeck");
    document.body.appendChild(el);

    const deckgl = new deck.DeckGL({
      container: "absMapDeck",
      latitude: 51.47,
      longitude: 0.45,
      zoom: 4,
      bearing: 0,
      pitch: 30,
      layers: [
        new deck.GeoJsonLayer({
          id: "base-map",
          data: abs,
          // Styles
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          opacity: 0.4,
          getLineDashArray: [3, 3],
          getLineColor: [60, 60, 60],
          getFillColor: [200, 200, 200]
        })
      ]
    });
  });

  const COUNTRIES =
    "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson";
  fetch(COUNTRIES)
    .then(res => res.json())
    .then(d => console.log(d));
</script>
