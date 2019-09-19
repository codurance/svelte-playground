<script>
  import { ABSChartFilter, Gender, GenderSelected } from "./store.js";
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
  import Radio from "@smui/radio";
  import FormField from "@smui/form-field";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Select, { Option } from "@smui/select";

  export let svgElementId;
  export let fileName;

  $: filters = [
    { value: 0, label: `${$GenderSelected} 65-74 anys que viuen sols` },
    { value: 1, label: `${$GenderSelected} 75-84 anys que viuen sols` },
    { value: 2, label: `${$GenderSelected} de 85 anys i més que viuen sols` }
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

<Card class="card-wrapping-chart" id="step3">
  <Content class="mdc-typography--body2">
    <slot />
  </Content>

  <Actions id="step4">
    <Select
      class="shaped"
      style="width: 20em"
      variant="filled"
      label="Filtres"
      bind:value={$ABSChartFilter}>
      {#each filters as { value, label }}
        <Option {value} selected={$ABSChartFilter === value}>{label}</Option>
      {/each}
    </Select>

    {#each Gender.options as gender}
      <FormField>
        <Radio bind:group={$GenderSelected} value={gender.name} />
        <span slot="label">{gender.name}</span>
      </FormField>
    {/each}

    <ActionIcons>
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
