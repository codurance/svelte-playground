<script>
  import { LensSelected } from "./store.js";
  import ActualWebsiteCopy from "./ActualWebsiteCopy.svelte"
  import NewProposalWrapper from "./NewProposalWrapper.svelte";
</script>

{#if $LensSelected == 'actualWebsiteCopy'}
  <ActualWebsiteCopy />
{:else}
  <NewProposalWrapper />
{/if}
