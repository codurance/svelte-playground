<script>
  import Fab from "@smui/fab";
  import { Icon } from "@smui/common";
  import { fade } from "svelte/transition";

  let minScroll = 300;
  $: showScrollButton = false;

  function shouldShowButton() {
    showScrollButton =
      document.body.scrollTop > minScroll ||
      document.documentElement.scrollTop > minScroll;
  }

  function scrollToTop() {
    const currentScroll = Math.max(
      document.body.scrollTop,
      document.documentElement.scrollTop
    );

    for (let scroll = currentScroll; scroll > 0; scroll--) {
      setTimeout(function() {
        document.body.scrollTop = scroll;
        document.documentElement.scrollTop = scroll;
      }, 1);
    }
  }
</script>

<svelte:window on:scroll={shouldShowButton} />

{#if showScrollButton}
  <div in:fade={{ duration: 200 }}>
    <Fab
      on:click={scrollToTop}
      style="position: fixed; bottom: 5%; right: 12px; z-index: 1; width: 50px;
      height: 50px;">
      <Icon class="material-icons">arrow_upward</Icon>
    </Fab>
  </div>
{/if}
