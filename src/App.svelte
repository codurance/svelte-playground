<script>
  import Drawer, {
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
  let drawer;
  let drawerOpen = false;
  let menu;

  function go(key) {
    current = key;
    drawerOpen = false;
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
      <IconButton
        class="material-icons"
        style="margin-top: 0.5em;"
        on:click={() => (drawerOpen = !drawerOpen)}>
        menu
      </IconButton>
      <Title>SiSalut - Demo</Title>
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

<Drawer variant="modal" bind:this={drawer} bind:open={drawerOpen}>
  <Content>
    <List>
      <Item
        href="javascript:void(0)"
        on:click={() => go('main')}
        activated={current === 'main'}>
        <Text>Mapes i gràfics per ABS</Text>
      </Item>
      <Item
        href="javascript:void(0)"
        on:click={() => go('other')}
        activated={current === 'other'}>
        <Text>ABS 1A - BCNeta</Text>
      </Item>
      <Item
        href="javascript:void(0)"
        on:click={() => go('other')}
        activated={current === 'other'}>
        <Text>ABS 1B - Casc Antic</Text>
      </Item>
      <Item
        href="javascript:void(0)"
        on:click={() => go('other')}
        activated={current === 'other'}>
        <Text>ABS 1C - Gòtic</Text>
      </Item>
    </List>
  </Content>
</Drawer>

<Scrim />

<AppContent>

  <Charts />

</AppContent>
