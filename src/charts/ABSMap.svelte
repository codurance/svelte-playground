<script>
  import { ABSMapFilter } from "../store.js";
  import { onMount } from "svelte";
  import Table from "./Table.svelte";

  const FINAL =
    "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";

  const path = d3.geoPath();

  let widthParent;
  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

  $: width = widthParent / 1.5;
  $: height = widthParent / 1.5;
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
        properties.VALORES ? properties.VALORES[$ABSMapFilter] : 0
      )
    );
    widthParent = d3
      .select("#map")
      .node()
      .getBoundingClientRect().width;
  });
  const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];

  function handleOnClick(absSelected) {
    ABSSelected = absSelected.properties;

    dialog.open();
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
        feature.properties.VALORES
          ? feature.properties.VALORES[$ABSMapFilter]
          : 0
      )
    );
    selectElement.attr("fill", quantizedColor);
  };

  const labels = [
    { color: "#fff", text: "De 8.5 a 11.10" },
    { color: "#ffd333", text: "De 11.11 a 12.30" },
    { color: "#ffde66", text: "De 12.31 a 13.60" },
    { color: "#fff4cc", text: "De 13.61 a 16.10" },
    { color: "#ffe999", text: "De 16.11 a 29.40" }
  ];

  let dialog;
  let ABSSelected = { };
</script>

<Table bind:ABSSelected={ABSSelected} bind:dialog={dialog} />

<div id="map">
  <svg viewBox={`0 0 ${width || 0} ${height || 0}`}>

    <g>
      {#if features}
        {#each features as feature}
          <path
            d={path(feature)}
            fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[$ABSMapFilter] : 0))}
            stroke="black"
            on:mouseover={handleMouseOver}
            on:mousemove={event => handleMouseMove(feature, event)}
            on:mouseout={handleMouseOut(feature)}
            on:click={()=> handleOnClick(feature)} />

          <text
            style="font-size: 10px"
            transform={`translate(${path.centroid(feature)})`}>
            {feature.properties.NOMABS.replace('Barcelona - ', '')}
          </text>
        {/each}
      {:else}loading{/if}
    </g>
    <g>
      {#each labels as { color, text }, i}
        <rect
          x="10"
          y={10 + 15 * i}
          width="10"
          height="10"
          stroke="black"
          stroke-width="1"
          fill={color} />
        <text x="25" y={19 + 15 * i} font-size="12">{text}</text>
      {/each}
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
    <p>
      {tooltipValues.VALORES ? tooltipValues.VALORES[$ABSMapFilter] : 'No Data'}
    </p>
  </div>
{/if}
