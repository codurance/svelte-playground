<script>
  import { onMount, afterUpdate } from "svelte";
  import { ABSMapFilter, ABSFilter } from "../store.js";
  import Card, {
    Content,
    PrimaryAction,
    Media,
    MediaContent,
    Actions,
    ActionButtons,
    ActionIcons
  } from "@smui/card";
  import IconButton, { Icon } from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import { fade, draw, fly } from "svelte/transition";
  import Table from "./Table.svelte";

  const FINAL =
    "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";
  const PATH = d3.geoPath();
  const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];

  export let listVisualization = false;
  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

  $: featuresFiltered =
    $ABSFilter && features
      ? features.filter(
          f =>
            f.properties.NOMSS.toLowerCase().includes(
              $ABSFilter.toLowerCase()
            ) ||
            getAbsCode(f)
              .toLowerCase()
              .includes($ABSFilter.toLowerCase())
        )
      : features;

  $: paths = [];
  $: quantize = d3
    .scaleQuantize()
    .domain(colorScaleExtent)
    .range(COLORS);
  $: absElement = null;

  onMount(async () => {
    const data = await fetch(FINAL);
    barcelona = await data.json();
    features = await topojson.feature(barcelona, barcelona.objects["ABS_2018"])
      .features;
    colorScaleExtent = d3.extent(
      barcelona.objects.ABS_2018.geometries.map(({ properties }) =>
        properties.VALORES ? properties.VALORES[$ABSMapFilter] : 0
      )
    );
  });

  afterUpdate(() => {
    paths = document.querySelectorAll(".paths");
  });

  function getAbsCode(feature) {
    return feature.properties.NOMABS.replace("Barcelona - ", "");
  }

  $: cardStyle = listVisualization
    ? "margin-bottom: 25px;"
    : "box-shadow:2px 2px rgba(0,0,0,0.2)";

  $: cardWrapper = listVisualization ? "" : "display:grid;";

  function handleMouseOver() {
    absElement = d3.select(this);
    absElement.attr("opacity", "1");
  }
  function handleMouseOut() {
    absElement = d3.select(this);
    absElement.attr("opacity", "0.3");
  }
  let ABSSelected;
  let dialog;

  function handleOnClick(absSelected) {
    ABSSelected = absSelected.properties;

    dialog.open();
  }
</script>

<Table bind:ABSSelected bind:dialog />

<div style={cardWrapper} class="cardWrapper">

  {#if featuresFiltered}
    {#each featuresFiltered as feature, i}
      <Card style={cardStyle} class="card-grid card-wrapping-chart">
        <PrimaryAction on:click={() => handleOnClick(feature)}>
          <Content style="color: #888;">
            <span style="color: black;">{feature.properties.NOMSS} -</span>
            <b>{getAbsCode(feature)}</b>
            <IconButton
              style="float: right; top: -13px"
              toggle
              aria-label="Add to favorites"
              title="Add to favorites">
              <Icon class="material-icons" on>favorite</Icon>
              <Icon class="material-icons">favorite_border</Icon>
            </IconButton>
          </Content>
          {#if !listVisualization}
            <svg
              width="350px"
              height="200px"
              style="left: 4%;"
              viewBox={`
          ${(paths[i] && paths[i].getBBox().x) || 0}
          ${(paths[i] && paths[i].getBBox().y) || 0}
          350
          200`}
              on:mouseover={handleMouseOver}
              on:mouseout={handleMouseOut}
              opacity="0.6">
              <g out:fly={{ y: -20, duration: 100 }}>
                <path
                  in:draw={{ duration: 1500 }}
                  id={`path-${getAbsCode(feature)}`}
                  class={`paths`}
                  d={PATH(feature)}
                  fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[$ABSMapFilter] : 0))}
                  stroke="black" />
              </g>
            </svg>
            <Content style="color: #888; font-size: 10px; padding-top: 0;">
              Per més informació
            </Content>
          {/if}
        </PrimaryAction>
      </Card>
    {/each}
  {/if}
</div>
