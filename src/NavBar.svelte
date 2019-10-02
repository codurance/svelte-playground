<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Search from "./charts/filters/Search.svelte";
  import { LensSelected } from "./store.js";

  function changeLens(newLens) {
    LensSelected.set(newLens);
  }
</script>

<TopAppBar
  variant="static"
  color="primary"
  style="display: flex; flex-direction: row; align-items: center; height: 65px">
  <Row>
    <Section>
      <img src="./images/logo.png" alt="SiSalut" />
    </Section>
    <Section align="end" toolbar>
      <img class="headerImage" src="./images/header.png" alt="SiSalut" />
    </Section>
  </Row>
</TopAppBar>

<div
  style="display: flex; align-items: center; height: 40px; background-color:
  #e1ddd5; padding: 8px 12px;">
  <a style="cursor: pointer" on:click={() => changeLens('actualWebsiteCopy')}>
    Home / section
  </a>
</div>

<TopAppBar variant="static" color="secondary">
  <Row>
    <div class="navBar">
      <Section id="step1" toolbar>
        <Title class="chart-title">
          Percentatge de persones grans que viuen soles per ABS i sexe.
          Barcelona, any 2017
        </Title>
      </Section>
      <Section id="step2" align="end" toolbar>
        <Search />
        <IconButton
          class="material-icons"
          aria-label="Map"
          on:click={() => changeLens('map')}>
          map
        </IconButton>
        <IconButton
          class="material-icons"
          aria-label="Chart"
          on:click={() => changeLens('absDeck')}>
          3d_rotation
        </IconButton>
        <IconButton
          class="material-icons"
          aria-label="Chart"
          on:click={() => changeLens('barchart')}>
          insert_chart
        </IconButton>
        <IconButton
          id="gridButton"
          class="material-icons"
          aria-label="Grid"
          on:click={() => changeLens('grid')}>
          grid_on
        </IconButton>
        <IconButton
          class="material-icons noVisibleInMobile"
          aria-label="List"
          on:click={() => changeLens('list')}>
          list
        </IconButton>
        <IconButton class="material-icons" aria-label="Favorite">
          favorite
        </IconButton>
        <IconButton class="material-icons" aria-label="Information">
          info
        </IconButton>
      </Section>
    </div>
  </Row>
</TopAppBar>
