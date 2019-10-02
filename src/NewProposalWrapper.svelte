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
  import Scroll from "./Scroll.svelte";
  import Intro from "./intro/Intro.svelte";
  import Footer from "./Footer.svelte";
</script>

<NavBar />

<Scroll />

<Scrim />

<AppContent>

  <Charts />

  <Intro />

</AppContent>

<Footer />
