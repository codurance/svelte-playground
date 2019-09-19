<script>
  import {
    AppContent,
    Content,
    Header,
    Title as TitleDrawer,
    Subtitle,
    Scrim
  } from "@smui/drawer";

  import NavBar from "./NavBar.svelte";
  import Charts from "./Charts.svelte";
  import Intro from "./intro/Intro.svelte";
  import Scroll from "./Scroll.svelte";
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

<NavBar />

<Scroll />

<Scrim />

<AppContent>

  <Charts />

  <Intro />

</AppContent>
