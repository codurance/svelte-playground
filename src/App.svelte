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

<NavBar />

<Scroll />

<Scrim />

<AppContent>

  <Charts />

  <Intro />

</AppContent>
