<script>
  import { ABSMapFilter } from "./store.js";
  import html2canvas from "html2canvas";
  import jsPDF from "jspdf";
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
  import Select, { Option } from "@smui/select";

  export let svgElementId;
  export let fileName;

  let selected = $ABSMapFilter;
  const filters = [
    { value: 0, label: "Homes 65-74 anys que viuen sols" },
    { value: 1, label: "Homes 75-84 anys que viuen sols" },
    { value: 2, label: "Homes de 85 anys i més que viuen sols" }
  ];

  function exportSvg(elementId, filename) {
    const SVG = document.querySelector(`#${elementId}`);

    html2canvas(SVG, { width: 1500, height: 2800, scale: 1 }).then(canvas => {
      let pdf = jsPDF("p", "pt", "a4", true);

      pdf.addImage(canvas.toDataURL(), "PNG", 0, -180, 700, 1000);

      pdf.save(filename);
    });
  }
</script>

<Card class="card-wrapping-chart">
  <Content class="mdc-typography--body2">
    <slot />
  </Content>

  <Actions>
    <Select
      class="shaped"
      variant="filled"
      label="Filtres"
      bind:value={selected}
      on:change={() => ABSMapFilter.set(selected)}>
      {#each filters as { value, label }}
        <Option {value} selected={selected === value}>{label}</Option>
      {/each}
    </Select>

    <slot name="aditionalFilter"/>

    <ActionIcons>
      <IconButton toggle aria-label="Add to favorites" title="Add to favorites">
        <Icon class="material-icons" on>favorite</Icon>
        <Icon class="material-icons">favorite_border</Icon>
      </IconButton>
      <IconButton class="material-icons" title="Share">share</IconButton>
      <IconButton
        class="material-icons"
        title="File download"
        on:click={() => exportSvg(svgElementId, fileName)}>
        file_download
      </IconButton>
    </ActionIcons>
  </Actions>
</Card>
