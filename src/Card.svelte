<script>
  import Card, {
    Content,
    PrimaryAction,
    Media,
    MediaContent,
    Actions,
    ActionButtons,
    ActionIcons
  } from "@smui/card";
  import Button, { Label } from "@smui/button";
  import IconButton, { Icon } from "@smui/icon-button";
</script>

<Card
  style="width: 80%; margin: 0 auto; margin-top: 20px; margin-bottom: 20px;">
  <Content class="mdc-typography--body2">
    <slot />
  </Content>
  <Actions>
    <ActionButtons>
      <Button>
        <Label>Filter</Label>
      </Button>
    </ActionButtons>
    <ActionIcons>
      <IconButton toggle aria-label="Add to favorites" title="Add to favorites">
        <Icon class="material-icons" on>favorite</Icon>
        <Icon class="material-icons">favorite_border</Icon>
      </IconButton>
      <IconButton class="material-icons" title="Share">share</IconButton>
      <IconButton class="material-icons" title="File download">
        file_download
      </IconButton>
    </ActionIcons>
  </Actions>
</Card>
