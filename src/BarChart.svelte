<script>
  import { onMount } from 'svelte'
  import Card, {Content, PrimaryAction, Media, MediaContent, Actions, ActionButtons, ActionIcons} from '@smui/card';
  import Button, {Label} from '@smui/button';
  import IconButton, {Icon} from '@smui/icon-button';

var options = {
    chart: {
        height: 1200,
        width: '90%',
        type: 'bar',
        toolbar: {
            tools: {
            download: false,
            },
        },
        },
        plotOptions: {
        bar: {
            horizontal: true,
        },
        },
        dataLabels: {
        enabled: false,
        },
        series: [
        {
            name: '',
            data: [],
        },
        ],
        xaxis: {
        categories: [],
        labels: {
            trim: false,
        },
    },
};
onMount(async () => {
   const fetched = await fetch('https://gist.githubusercontent.com/damianpumar/f5110a8cf1c2a99408a4cc40235e6790/raw/c7cfcac7a10a2cf25359454756fcd6c82763d7c8/barchart');
    const data = await fetched.json();
    
        options.xaxis.categories = data.categories.map(
        category => category.name,
        );
        options.series[0].data = data.dataset.set.map(series =>
        parseFloat(series.value),
        );

        var chart = new ApexCharts(
        document.querySelector('#chart'),
        options,
        );

        chart.render();
}) 

</script>
<Card style="width: 80%; margin: 0 auto; margin-top: 20px; margin-bottom: 20px;">
  <Content class="mdc-typography--body2">
      <div id="chart"></div>
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