<script>
  import { onMount, afterUpdate } from "svelte";
  import Card, {
    Content,
    Actions,
    ActionIcons,
    PrimaryAction
  } from "@smui/card";
  import IconButton, { Icon } from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import { fade, draw, fly } from "svelte/transition";
  import { ABSBarcelonaMapEndpoint } from "../store.endpoint.js";
  import { ABSFilter, getAbsCode, filterABS } from "../store.abs.js";
  import { ColorGender } from "../store.gender.js";
  import CardWrapper from "../Card.svelte";
  import Table from "./Table.svelte";

  const PATH = d3.geoPath();

  export let listVisualization = false;
  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];
  let ABSSelected;
  let dialog;
  let favoriteClicked = false;

  $: featuresFiltered = filterABS(features, $ABSFilter);

  $: paths = [];
  $: quantize = d3
    .scaleQuantize()
    .domain(colorScaleExtent)
    .range(ColorGender.Mix);
  $: absElement = null;
  $: cardStyle = listVisualization
    ? "margin-bottom: 25px;"
    : "box-shadow:2px 2px rgba(0,0,0,0.2)";
  $: cardWrapper = listVisualization ? "" : "display:grid;";

  onMount(async () => {
    const data = await fetch(ABSBarcelonaMapEndpoint);

    barcelona = await data.json();

    features = await topojson
      .feature(barcelona, barcelona.objects["ABS_2018"])
      .features.sort((a, b) => getAbsCode(a).localeCompare(getAbsCode(b)));

    colorScaleExtent = d3.extent(
      barcelona.objects.ABS_2018.geometries.map(({ properties }) =>
        properties.VALORES ? properties.VALORES[2] : 0
      )
    );
  });

  afterUpdate(() => {
    paths = document.querySelectorAll(".paths");
  });

  function handleMouseOver() {
    absElement = d3.select(this);
    absElement.attr("opacity", "1");
  }

  function handleMouseOut() {
    absElement = d3.select(this);
    absElement.attr("opacity", "0.3");
  }

  function handleOnClick(absSelected) {
    if (!favoriteClicked) {
      ABSSelected = absSelected;

      dialog.open();
    }
    favoriteClicked = false;
  }
</script>

<CardWrapper showFilterSection="false">

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
                style="float: right; top: -13px;"
                toggle
                on:click={() => (favoriteClicked = true)}
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
                    fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[2] : 0))}
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
      {#if featuresFiltered.length === 0}
        <p>No s'han trobat resultats.</p>
      {/if}
    {/if}
  </div>

</CardWrapper>
