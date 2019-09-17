<script>
  import { tick } from "svelte";
  import IconButton from "@smui/icon-button";
  import { fade } from "svelte/transition";
  import { ABSFilter } from "./store.js";

  let isVisibleSearchInput = false;

  async function showSearch() {
    isVisibleSearchInput = !isVisibleSearchInput;
    await tick();
    document.getElementById("searchInput").focus();
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
    transition:fade
    type="text"
    class="searchBox"
    placeholder="Cercar"
    bind:value={$ABSFilter} />
{/if}
