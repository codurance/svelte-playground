<script>
  import {
    AppContent,
    Content,
    Header,
    Title as TitleDrawer,
    Subtitle,
    Scrim
  } from "@smui/drawer";
  import List, { Item, Text, Separator, Subheader } from "@smui/list";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";
  import Fab, { Icon } from "@smui/fab";

  import MenuSurface, { Anchor } from "@smui/menu-surface";

  import Charts from "./Charts.svelte";

  let current = "main";
  let menu;

  function changeLens(newLens) {
    
  };
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
      <img src="/images/logo.jpg" alt="SiSalut" />
      <Title>SiSalut - Demo</Title>
    </Section>
    <Section align="end" toolbar>
      <img src="/images/header.jpg" alt="SiSalut" />
    </Section>
  </Row>
</TopAppBar>
<TopAppBar variant="static" color="secondary">
  <Row>
    <Section>
        <IconButton class="material-icons" aria-label="Search">search</IconButton>
        <IconButton class="material-icons" aria-label="Grid"
                    on:click={() => changeLens("grid")}>grid_on</IconButton>
        <IconButton class="material-icons" aria-label="List"
                    on:click={() => changeLens("list")}>
                    list</IconButton>
        <IconButton class="material-icons" aria-label="Map"
                    on:click={() => changeLens("map")}>map</IconButton>
        <IconButton class="material-icons" aria-label="Chart"
                    on:click={() => changeLens("chart")}>
                    insert_chart</IconButton>
    </Section>
    <Section align="end" toolbar>
        <IconButton class="material-icons" aria-label="Search">brightness_5</IconButton>
        <IconButton class="material-icons" aria-label="Search">brightness_2</IconButton>
    </Section>
   </Row>
</TopAppBar>
<TopAppBar variant="static" color="secondary">
  <Title>
    Percentatge de persones grans que viuen soles per ABS i sexe. Barcelona, any
    2017
  </Title>
</TopAppBar>
<Fab
  on:click={() => menu.setOpen(true)}
  style="position: fixed; bottom: 1rem; right: 2rem; z-index: 1;">
  <Icon class="material-icons">search</Icon>
</Fab>

<div style="position: fixed; bottom: 2rem; right: 6rem; z-index: 1;">
  <MenuSurface bind:this={menu} anchorCorner="BOTTOM_RIGHT">
    <input type="text" placeholder="Cercar" class="searchBox" />
  </MenuSurface>
</div>

<Scrim />

<AppContent>

  <Charts />

</AppContent>
