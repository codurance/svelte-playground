<script>
  import { ABSChartFilter, Gender, GenderSelected } from "../../store.js";
  import FormField from "@smui/form-field";
  import Select, { Option } from "@smui/select";
  import Radio from "@smui/radio";

  $: filters = [
    { value: 0, label: `${$GenderSelected} 65-74 anys que viuen sols` },
    { value: 1, label: `${$GenderSelected} 75-84 anys que viuen sols` },
    { value: 2, label: `${$GenderSelected} de 85 anys i més que viuen sols` }
  ];
</script>

<Select
  class="shaped"
  style="min-width: 18em"
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
