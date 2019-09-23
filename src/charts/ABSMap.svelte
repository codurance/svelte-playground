<script>
  import { onMount, tick } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, draw, fly } from "svelte/transition";
  import {
    ABSChartFilter,
    getAbsCode,
    isMatchABS,
    ABSFilter
  } from "../store.abs.js";
  import { ABSBarcelonaMapEndpoint } from "../store.endpoint.js";
  import { Gender, GenderSelected, ColorGender } from "../store.gender.js";
  import Card from "../Card.svelte";
  import Table from "./Table.svelte";
  import ABSFilters from "./filters/ABSFilters.svelte";

  const path = d3.geoPath();

  let dialog;
  let ABSSelected;
  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

  $: isMixSelected = Gender.isMix($GenderSelected);
  $: isManSelected = Gender.isMan($GenderSelected);
  $: isWomanSelected = Gender.isWoman($GenderSelected);
  $: colors = isMixSelected
    ? ColorGender.Mix
    : isManSelected
    ? ColorGender.Man
    : ColorGender.Woman;
  $: labels = [
    { color: colors[0], text: "De 8.5 a 11.10" },
    { color: colors[1], text: "De 11.11 a 12.30" },
    { color: colors[2], text: "De 12.31 a 13.60" },
    { color: colors[3], text: "De 13.61 a 16.10" },
    { color: colors[4], text: "De 16.11 a 29.40" }
  ];

  $: bbox = { width: 0, height: 0, x: 0, y: 0 };
  $: quantize = d3
    .scaleQuantize()
    .domain(colorScaleExtent)
    .range(colors);
  $: selectElement = null;
  $: showTooltip = false;
  $: tooltipValues = {};

  $: isMatchinABSFilter = feature => {
    return isMatchABS(feature, $ABSFilter);
  };

  $: getFill = feature => {
    return isMatchinABSFilter(feature)
      ? quantize(
          Number(
            feature.properties.VALORES
              ? feature.properties.VALORES[$ABSChartFilter]
              : 0
          )
        )
      : "gray";
  };

  onMount(async () => {
    const data = await fetch(ABSBarcelonaMapEndpoint);
    barcelona = await data.json();
    features = await topojson.feature(barcelona, barcelona.objects.ABS_2018)
      .features;
    colorScaleExtent = d3.extent(
      barcelona.objects.ABS_2018.geometries.map(({ properties }) =>
        properties.VALORES ? properties.VALORES[$ABSChartFilter] : 0
      )
    );

    await tick();

    handleLoadSvg();
  });

  function handleLoadSvg() {
    bbox = document.getElementById("absMap").getBBox();
  }

  function handleOnClick(feature) {
    if (!isMatchinABSFilter(feature)) return;
    ABSSelected = feature;
    dialog.open();
  }

  const handleMouseOver = feature => event => {
    if (!isMatchinABSFilter(feature)) return;
    showTooltip = true;
    selectElement = d3.select(event.srcElement);
    selectElement.attr("stroke-width", 5);
    selectElement.attr("filter", "url(#glow)");
  };

  function handleMouseMove(feature, event) {
    if (!isMatchinABSFilter(feature)) return;
    const { NOMABS, NOMAGA, NOMSS, VALORES } = feature.properties;
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
    if (!isMatchinABSFilter(feature)) return;
    showTooltip = false;
    const quantizedColor = quantize(
      Number(
        feature.properties.VALORES
          ? feature.properties.VALORES[$ABSChartFilter]
          : 0
      )
    );
    selectElement.attr("fill", quantizedColor);
    selectElement.attr("stroke-width", 1);
    selectElement.attr("filter", "none");
  };
</script>

<Card svgElementId="map" fileName="ABS Barcelona Map">

  <div slot="filter">
    <ABSFilters />
  </div>

  <Table bind:ABSSelected bind:dialog />

  <div>
    <svg
      id="absMap"
      viewBox={`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`}>

      <filter id="glow">
        <feGaussianBlur stdDeviation="15" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <g out:fade={{ duration: 200 }}>
        {#if features}
          {#each features as feature, i}
            <path
              style="cursor: pointer;"
              in:draw={{ duration: 3000 }}
              d={path(feature)}
              fill={getFill(feature)}
              stroke="black"
              on:mouseover={handleMouseOver(feature)}
              on:mousemove={event => handleMouseMove(feature, event)}
              on:mouseout={handleMouseOut(feature)}
              on:click={() => handleOnClick(feature)} />

            <g out:fly={{ y: -20, duration: 200 }}>
              <text
                in:fade={{ delay: 1000 + i * 15, duration: 200 }}
                style="font-size: 10px; pointer-events: none; cursor: pointer;"
                transform={`translate(${path.centroid(feature)})`}>
                {getAbsCode(feature)}
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
        {#if isMixSelected || isManSelected}
          <img
            src="./icons/oldman.svg"
            alt="Old Man"
            width="25px"
            height="25px" />
          {tooltipValues.VALORES ? tooltipValues.VALORES[$ABSChartFilter] : 'No Data'}
        {/if}

        {#if isMixSelected || isWomanSelected}
          <img
            src="./icons/oldwoman.svg"
            alt="Old Woman"
            width="25px"
            height="25px" />
          {tooltipValues.VALORES ? tooltipValues.VALORES[$ABSChartFilter] * 2 : 'No Data'}
        {/if}
      </p>
    </div>
  {/if}

</Card>
