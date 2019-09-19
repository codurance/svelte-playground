<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import { LensSelected } from "./store.js";
  import Search from "./Search.svelte";

  function changeLens(newLens) {
    LensSelected.set(newLens);
  }
</script>

<TopAppBar variant="static" color="primary">
  <Row>
    <Section>
      <img src="./images/logo.png" alt="SiSalut" />
    </Section>
    <Section align="end" toolbar>
      <img class="headerImage" src="./images/header.png" alt="SiSalut" />
    </Section>
  </Row>
</TopAppBar>
<TopAppBar variant="static" color="secondary">
  <Row>
    <Section id="step1" toolbar>
      <Title class="chart-title">
        Percentatge de persones grans que viuen soles per ABS i sexe. Barcelona,
        any 2017
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
      <IconButton
        id="favoriteButton"
        class="material-icons"
        aria-label="Favorite">
        favorite
      </IconButton>
    </Section>
  </Row>
</TopAppBar>
