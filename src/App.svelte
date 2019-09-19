<script>
  import {
    AppContent,
    Content,
    Header,
    Title as TitleDrawer,
    Subtitle,
    Scrim
  } from "@smui/drawer";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import { LensSelected } from "./store.js";

  import Charts from "./Charts.svelte";
  import Intro from "./intro/Intro.svelte";
  import Scroll from "./Scroll.svelte";
  import Search from "./Search.svelte";

  function changeLens(newLens) {
    LensSelected.set(newLens);
  }
</script>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto+Mono" />

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
        class="material-icons"
        aria-label="List"
        on:click={() => changeLens('list')}>
        list
      </IconButton>
    </Section>
  </Row>
</TopAppBar>
<Scroll />

<Scrim />

<AppContent>

  <Charts />

  <Intro />

</AppContent>
