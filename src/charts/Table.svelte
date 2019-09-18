<script>
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton, { Icon } from "@smui/icon-button";

  export let dialog = {};
  export let ABSSelected = {};

  function getAbsCode(feature) {
    return feature.NOMABS ? feature.NOMABS.replace("Barcelona - ", "") : "";
  }

  function createTitle(feature) {
    return feature.NOMSS
      ? feature.NOMSS + " - " + getAbsCode(feature)
      : feature.NOMABS;
  }
</script>

<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  style="z-index: 99999"
  on:MDCDialog:closed={() => dialog.close()}>
  <Title id="dialog-title">
    {createTitle(ABSSelected)}
    <IconButton
      id="close-dialog"
      class="material-icons"
      title="Close"
      on:click={() => dialog.close()}>
      close
    </IconButton>
  </Title>
  <Content id="dialog-content">
    <DataTable table$aria-label="Products">
      <Head>
        <Row>
          <Cell />
          <Cell>ABS {getAbsCode(ABSSelected)}</Cell>
          <Cell>{ABSSelected.NOMAGA}</Cell>
          <Cell>AIS BCN Esquerra</Cell>
          <Cell>Barcelona</Cell>
        </Row>
        <Row>
          <Cell />
          <Cell>N%</Cell>
          <Cell>N%</Cell>
          <Cell>N%</Cell>
          <Cell>N%</Cell>
        </Row>
      </Head>
      <Body>
        <Row>
          <Cell>PERSONES PER LLAR (mitjana)</Cell>
          <Cell>2.3</Cell>
          <Cell>2.3</Cell>
          <Cell>2.3</Cell>
          <Cell>2.3</Cell>
        </Row>
        <Row>
          <Cell>LLARS AMB >4 PERSONES</Cell>
          <Cell>2.4</Cell>
          <Cell>0.4</Cell>
          <Cell>9.4</Cell>
          <Cell>1.4</Cell>
        </Row>
        <Row>
          <Cell>PERSONES GRANS QUE VIUEN SOLES</Cell>
          <Cell />
          <Cell />
          <Cell />
          <Cell />
        </Row>
        <Row>
          <Cell>Homes 65-74 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>5.4</Cell>
          <Cell>3.4</Cell>
          <Cell>7.4</Cell>
        </Row>
        <Row>
          <Cell>Dones 65-74 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>3.4</Cell>
          <Cell>6.4</Cell>
          <Cell>8.4</Cell>
        </Row>
        <Row>
          <Cell>Homes 75-84 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>3.4</Cell>
          <Cell>6.4</Cell>
          <Cell>8.4</Cell>
        </Row>
        <Row>
          <Cell>Dones 75-84 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>3.4</Cell>
          <Cell>6.4</Cell>
          <Cell>8.4</Cell>
        </Row>
        <Row>
          <Cell>Homes >=85 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>3.4</Cell>
          <Cell>6.4</Cell>
          <Cell>8.4</Cell>
        </Row>
        <Row>
          <Cell>Dones >=85 anys</Cell>
          <Cell>2.4</Cell>
          <Cell>3.4</Cell>
          <Cell>6.4</Cell>
          <Cell>8.4</Cell>
        </Row>
      </Body>
    </DataTable>

  </Content>
  <Actions>
    <IconButton class="material-icons" title="Share">share</IconButton>
    <IconButton class="material-icons" title="File download">
      file_download
    </IconButton>
  </Actions>
</Dialog>
