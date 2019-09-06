<script>
  import { onMount } from "svelte";
  const FINAL =
    "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";

  const path = d3.geoPath();

  let widthParent;
  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

  $: width = widthParent;
  $: height = widthParent;
  $: filter = 0;
  $: quantize = d3
    .scaleQuantize()
    .domain(colorScaleExtent)
    .range(COLORS);
  $: selectElement = null;
  $: showTooltip = false;
  $: tooltipValues = {};

  onMount(async () => {
    const data = await fetch(FINAL);
    barcelona = await data.json();
    features = await topojson.feature(barcelona, barcelona.objects.ABS_2018)
      .features;
    colorScaleExtent = d3.extent(
      barcelona.objects.ABS_2018.geometries.map(({ properties }) =>
        properties.VALORES ? properties.VALORES[filter] : 0
      )
    );
    widthParent = d3
      .select("#map")
      .node()
      .getBoundingClientRect().width;
  });
  const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];

  function setFilter(indexOfFilter) {
    filter = indexOfFilter;
  }

  function handleMouseOver() {
    showTooltip = true;
    selectElement = d3.select(this);
    selectElement.attr("fill", "orange");
  }

  function handleMouseMove(d, event) {
    const { NOMABS, NOMAGA, NOMSS, VALORES } = d.properties;
    tooltipValues = {
      NOMABS,
      NOMAGA,
      NOMSS,
      VALORES,
      left: event.clientX,
      top: event.clientY
    };
  }

  const handleMouseOut = feature => () => {
    showTooltip = false;
    const quantizedColor = quantize(
      Number(
        feature.properties.VALORES ? feature.properties.VALORES[filter] : 0
      )
    );
    selectElement.attr("fill", quantizedColor);
  };
</script>

<div id="map">
  <div>
    <button on:click={() => setFilter(0)}>filter 1</button>
    <button on:click={() => setFilter(1)}>filter 2</button>
    <button on:click={() => setFilter(2)}>filter 3</button>
  </div>
  <svg viewBox={`0 0 ${width || 0} ${height || 0}`}>
    <g>
      {#if features}
        {#each features as feature}
          <path
            d={path(feature)}
            fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[filter] : 0))}
            stroke="black"
            on:mouseover={handleMouseOver}
            on:mousemove={event => handleMouseMove(feature, event)}
            on:mouseout={handleMouseOut(feature)} />

          <text
            style="font-size: 10px"
            transform={`translate(${path.centroid(feature)})`}>
            {feature.properties.NOMABS.replace('Barcelona - ', '')}
          </text>
        {/each}
      {:else}loading{/if}
    </g>
  </svg>
</div>
{#if showTooltip}
  <div
    class="tooltip"
    style={showTooltip ? `opacity: .9; top: ${tooltipValues.top}px; left: ${tooltipValues.left}px` : 'opacity: 0'}>
    <p>{tooltipValues.NOMABS}</p>
    <p>{tooltipValues.NOMAGA}</p>
    <p>{tooltipValues.NOMSS}</p>
    <p>{tooltipValues.VALORES ? tooltipValues.VALORES[filter] : 'No Data'}</p>
  </div>
{/if}
