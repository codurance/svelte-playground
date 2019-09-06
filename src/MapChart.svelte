<script>
  import Card, {Content, PrimaryAction, Media, MediaContent, Actions, ActionButtons, ActionIcons} from '@smui/card';
  import Button, {Label} from '@smui/button';
  import IconButton, {Icon} from '@smui/icon-button';
  import BarcelonaMap from './BarcelonaMap.svelte'; 

</script>
<Card style="width: 80%; margin: 0 auto; margin-top: 20px; margin-bottom: 20px;">
  <Content class="mdc-typography--body2">
      <BarcelonaMap />
  </Content>
  <Actions>
    <ActionButtons>
      <Button on:click={() => doAction('addToCart')}>
        <Label>Filter</Label>
      </Button>
    </ActionButtons>
    <ActionIcons>
      <IconButton on:click={() => doAction('addToFavoritesToggle')} toggle aria-label="Add to favorites" title="Add to favorites">
        <Icon class="material-icons" on>favorite</Icon>
        <Icon class="material-icons">favorite_border</Icon>
      </IconButton>
      <IconButton class="material-icons" on:click={() => doAction('share')} title="Share">share</IconButton>
      <IconButton class="material-icons" on:click={() => doAction('file-download')} title="File download">file_download</IconButton>
    </ActionIcons>
  </Actions>
</Card>