<script>
  import { onMount } from "svelte";
  import Table from "./Table.svelte";

  let options = {
    chart: {
      height: "1200",
      width: "100%",
      type: "bar",
      toolbar: {
        tools: {
          download: false
        }
      },
      events: {
        click: function(event, chartContext, config){
          if(config.dataPointIndex >= 0) {
              ABSSelected.NOMAGA = ABSSelected.NOMABS = config.config.xaxis.categories[config.dataPointIndex];
              dialog.open();
          }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: false
    },
    series: [
      {
        name: "",
        data: []
      }
    ],
    xaxis: {
      categories: [],
      labels: {
        trim: false
      },
      title: {
          text: '% persones que viuen soles',
          style: {
            fontSize:  '18px'
          },
      },
    },
    yaxis: {
      title: {
          text: 'Àrees Bàsiques de Salut',
          style: {
            fontSize:  '18px'
          },
      },
    }
  };

  let dialog;
  let ABSSelected = {
    NOMABS: "",
    NOMAGA: ""
   };

  onMount(async () => {
    const fetched = await fetch(
      "https://gist.githubusercontent.com/damianpumar/f5110a8cf1c2a99408a4cc40235e6790/raw/c7cfcac7a10a2cf25359454756fcd6c82763d7c8/barchart"
    );
    const data = await fetched.json();

    options.xaxis.categories = data.categories.map(category => category.name);
    options.series[0].data = data.dataset.set.map(series =>
      parseFloat(series.value)
    );

    var chart = new ApexCharts(document.querySelector("#barchart"), options);

    chart.render();
  });
</script>

<Table bind:ABSSelected={ABSSelected} bind:dialog={dialog} />
<div id="barchart" />
