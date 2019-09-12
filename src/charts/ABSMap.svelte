<script>
  import { ABSMapFilter, MapBBox } from "../store.js";
  import { onMount } from "svelte";
  import Table from "./Table.svelte";
  import { quintOut } from 'svelte/easing';
  import { fade, draw, fly } from 'svelte/transition';

  const HOMESCOLOR = ["#ffffff", "#6fd1f2", "#12c4ff", "#089dcf", "#00769e"];
  const MIXCOLOR = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];
  const FINAL =
    "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";

  const path = d3.geoPath();

  export let mixSelected;
  let dialog;
  let ABSSelected = { };

  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

  $: bbox = $MapBBox;
  $: filter = 0;
  $: colors = mixSelected ? MIXCOLOR : HOMESCOLOR;
  $: labels = [
    { color: colors[0], text: "De 8.5 a 11.10" },
    { color: colors[1], text: "De 11.11 a 12.30" },
    { color: colors[2], text: "De 12.31 a 13.60" },
    { color: colors[3], text: "De 13.61 a 16.10" },
    { color: colors[4], text: "De 16.11 a 29.40" }
  ];
  $: quantize = d3
    .scaleQuantize()
    .domain(colorScaleExtent)
    .range(colors);
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
  });

  function handleLoadSvg() {
    MapBBox.set(document.querySelector('svg').getBBox());
  }

  function handleOnClick(absSelected) {
    ABSSelected = absSelected.properties;

    dialog.open();
  }

  function handleMouseOver() {
    showTooltip = true;
    selectElement = d3.select(this);
    selectElement.attr("fill", mixSelected ? "lightblue": "orange");
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

</script>
<svelte:window on:resize={handleLoadSvg}/>
<Table bind:ABSSelected={ABSSelected} bind:dialog={dialog} />

<div data-intro='Este es un ejemplo de visualización modo Mapa, si seleccionas un sector y haces click podrás ver el detalle' data-step="4" data-disable-interaction="true">
  <svg id="absMap" viewBox={`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`} on:load={handleLoadSvg}>

    <g out:fade="{{duration: 200}}">
      {#if features}
        {#each features as feature, i}
          <path in:draw="{{duration: 3000}}"
            d={path(feature)}
            fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[$ABSMapFilter] : 0))}
            stroke="black"
            on:mouseover={handleMouseOver}
            on:mousemove={event => handleMouseMove(feature, event)}
            on:mouseout={handleMouseOut(feature)}
            on:click={()=> handleOnClick(feature)} />

        <g out:fly="{{y: -20, duration: 200}}">
          <text in:fade="{{delay: 1000 + i * 15, duration: 200}}"
            style="font-size: 10px"
            transform={`translate(${path.centroid(feature)})`}>
            {feature.properties.NOMABS.replace('Barcelona - ', '')}
          </text>
        </g>
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
    <img src="./icons/oldman.svg" alt="Old Man" width="25px" height="25px"/>
    {tooltipValues.VALORES ? tooltipValues.VALORES[$ABSMapFilter] : 'No Data'}
    {#if mixSelected}
      <img src="./icons/oldwoman.svg" alt="Old Man" width="25px" height="25px"/>
      {tooltipValues.VALORES ? tooltipValues.VALORES[$ABSMapFilter] * 2 : 'No Data'}
    {/if}
    </p>
  </div>
{/if}
