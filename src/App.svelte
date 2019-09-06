<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">

<TopAppBar variant="static" color="primary">
  <Row>
    <Section>
      <IconButton class="material-icons" style="margin-top: 0.5em;" on:click={() => drawerOpen = !drawerOpen}>menu</IconButton>
      <Title>SiSalut - Demo</Title>
    </Section>
  </Row>
</TopAppBar>
<TopAppBar variant="static" color="secondary">
    <Title>Percentatge de persones grans que viuen soles per ABS i sexe. Barcelona, any 2017</Title>
</TopAppBar>
<Fab on:click={doSomething} style="position: fixed; bottom: 1rem; right: 2rem; z-index: 1;"><Icon class="material-icons">search</Icon></Fab>

<Drawer variant="modal" bind:this={drawer} bind:open={drawerOpen}>
  <Content>
    <List>
      <Item href="javascript:void(0)" on:click={() => go('main')} activated={current === 'main'}>
        <Text>Mapes i gràfics per ABS</Text>
      </Item>
      <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
        <Text>ABS 1A - BCNeta</Text>
      </Item>
      <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
        <Text>ABS 1B - Casc Antic</Text>
      </Item>
      <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
        <Text>ABS 1C - Gòtic</Text>
      </Item>
    </List>
  </Content>
</Drawer>

<Scrim />

<AppContent>

  <Charts/>

</AppContent>


<script>
  import Drawer, {AppContent, Content, Header, Title as TitleDrawer, Subtitle, Scrim} from '@smui/drawer';
  import List, {Item, Text, Separator, Subheader} from '@smui/list';
  import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Charts from './Charts.svelte';
  
  import Fab, {Icon} from '@smui/fab';

  function doSomething() {
    alert('something');
  }

  let current = 'main';
  let drawer;
  let drawerOpen = false;

  function go(key) {
    current = key;
    drawerOpen = false;
  }
</script>