<script>
  import html2canvas from "html2canvas";
  import jsPDF from "jspdf";
  import Card, { Content, Actions, ActionIcons } from "@smui/card";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";

  export let svgElementId;
  export let fileName;

  function exportSvg(elementId, filename) {
    const SVG = document.querySelector(`#${elementId}`);

    html2canvas(SVG, { width: 1500, height: 2800, scale: 1 }).then(canvas => {
      let pdf = jsPDF("p", "pt", "a4", true);

      pdf.addImage(canvas.toDataURL(), "PNG", 0, -180, 700, 1000);

      pdf.save(filename);
    });
  }
</script>

<Card class="card-wrapping-chart" id="step3">
  <Actions id="step4">
    <slot name="filter" />
  </Actions>
  <Content class="mdc-typography--body2">
    <slot />
  </Content>
  <ActionIcons id="step5">
    <IconButton class="material-icons" title="Share">share</IconButton>
    <IconButton
      class="material-icons"
      title="File download"
      on:click={() => exportSvg(svgElementId, fileName)}>
      file_download
    </IconButton>
  </ActionIcons>
</Card>
