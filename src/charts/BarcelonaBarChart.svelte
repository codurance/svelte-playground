<script>
  import { onMount } from "svelte";

  var options = {
    chart: {
      height: 1200,
      width: "90%",
      type: "bar",
      toolbar: {
        tools: {
          download: false
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
      }
    }
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

    var chart = new ApexCharts(document.querySelector("#chart"), options);

    chart.render();
  });
</script>

<div id="chart" />
