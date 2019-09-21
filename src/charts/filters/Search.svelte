<script>
  import { tick } from "svelte";
  import IconButton from "@smui/icon-button";
  import { fade } from "svelte/transition";
  import { ABSFilter } from "../../store.abs.js";

  const escapeKeyCode = 27;
  let isVisibleSearchInput = false;

  async function showSearch() {
    toggleVisibility();
    await tick();
    document.getElementById("searchInput").focus();
  }

  function toggleVisibility() {
    isVisibleSearchInput = !isVisibleSearchInput;
  }

  function handleKeydown(event) {
    if (event.keyCode === escapeKeyCode) {
      toggleVisibility();
    }
  }
</script>

<IconButton
  id="searchButton"
  class="material-icons"
  aria-label="Search"
  on:click={() => showSearch()}>
  search
</IconButton>
{#if isVisibleSearchInput}
  <input
    id="searchInput"
    type="text"
    class="searchBox"
    placeholder="Cercar"
    transition:fade
    bind:value={$ABSFilter}
    on:keydown={handleKeydown} />
{/if}
