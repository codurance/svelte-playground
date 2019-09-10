<script>
  import { onMount, afterUpdate } from "svelte";
  import { ABSMapFilter } from "../store.js";
  import Card, {
    Content,
    PrimaryAction,
    Media,
    MediaContent,
    Actions,
    ActionButtons,
    ActionIcons
  } from "@smui/card";
  import Button, { Label } from "@smui/button";

  const FINAL =
    "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";
  const PATH = d3.geoPath();
  const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];

  let features;
  let barcelona;
  let colorScaleExtent = [0, 0];

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

  const cardWrapper = `
  display: grid;
  width: 80%;
  margin: 20px auto;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-auto-rows: minmax(150px, auto);
  grid-gap: 20px;
  rows-gap: 20px;
`;
  const card = `
  border-radius: 4px;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
  background-color: #fff;
`;

  function handleMouseOver() {
    absElement = d3.select(this);
    absElement.attr("opacity", "1");
  }
  function handleMouseOut() {
    absElement = d3.select(this);
    absElement.attr("opacity", "0.3");
  }
</script>

<div style={cardWrapper}>

  {#if features}
    {#each features as feature, i}
      <Card style="cursor: pointer; box-shadow:2px 2px rgba(0,0,0,0.2)">
        <PrimaryAction on:click={() => window.alert('aaa')}>

          <svg
            width="350px"
            height="200px"
            viewBox={`
        ${(paths[i] && paths[i].getBBox().x) || 0}
        ${(paths[i] && paths[i].getBBox().y) || 0}
        350
        200`}
            on:mouseover={handleMouseOver}
            on:mouseout={handleMouseOut}
            opacity="0.6">
            <g>
              <path
                id={`path-${getAbsCode(feature)}`}
                class={`paths`}
                d={PATH(feature)}
                fill={quantize(Number(feature.properties.VALORES ? feature.properties.VALORES[$ABSMapFilter] : 0))}
                stroke="black" />
            </g>
          </svg>
          <Content style="color: #888;">
            <span style="color: black;">{feature.properties.NOMSS} -</span>
            <b>{getAbsCode(feature)}</b>
          </Content>
          <Content style="color: #888; font-size: 10px; padding-top: 0;">
            Per més informació
          </Content>
        </PrimaryAction>
      </Card>
    {/each}
  {:else}loading{/if}

</div>
