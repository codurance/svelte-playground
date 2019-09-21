<script>
  import { onMount } from "svelte";
  import { ABSBarcelonaChartEndpoint } from "../store.endpoint.js";
  import { ABSChartFilter } from "../store.abs.js";
  import { Gender, GenderSelected, ColorGender } from "../store.gender.js";
  import Card from "../Card.svelte";
  import Table from "./Table.svelte";
  import ABSFilters from "./filters/ABSFilters.svelte";

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
        click: function(event, chartContext, config) {
          if (config.dataPointIndex >= 0) {
            ABSSelected = {
              properties: {
                NOMAGA: "",
                NOMABS: ""
              }
            };
            ABSSelected.properties.NOMAGA = ABSSelected.properties.NOMABS =
              config.config.xaxis.categories[config.dataPointIndex];
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
    xaxis: {
      categories: [],
      labels: {
        trim: false
      },
      title: {
        text: "% persones que viuen soles",
        style: {
          fontSize: "18px"
        }
      }
    },
    yaxis: {
      title: {
        text: "Àrees Bàsiques de Salut",
        style: {
          fontSize: "18px"
        }
      }
    }
  };

  let dialog;
  let ABSSelected;
  let chart;
  let originalSeriesValue;

  let data = null;

  onMount(async () => {
    const fetched = await fetch(ABSBarcelonaChartEndpoint);

    data = await fetched.json();

    updateOption(data);

    chart = new ApexCharts(document.querySelector("#barchart"), options);

    chart.render();
  });

  function updateOption(data) {
    options.colors = Gender.isMix($GenderSelected)
      ? [ColorGender.Man[2], ColorGender.Woman[2]]
      : Gender.isMan($GenderSelected)
      ? [ColorGender.Man[2]]
      : [ColorGender.Woman[2]];

    options.xaxis.categories = data.categories.map(category => category.name);

    originalSeriesValue = data.dataset.set.map(series =>
      parseFloat(series.value)
    );

    updateValue(originalSeriesValue);
  }

  function updateValue(originalSeriesValue) {
    const serieValue =
      $ABSChartFilter > 0
        ? originalSeriesValue.map(s => Math.trunc(s * ($ABSChartFilter + 0.1))) //TODO: Replace for real data
        : originalSeriesValue;

    options.series = [];

    if (Gender.isMix($GenderSelected) || Gender.isMan($GenderSelected)) {
      options.series.push({
        name: "Homes",
        data: serieValue
      });
    }

    if (Gender.isMix($GenderSelected) || Gender.isWoman($GenderSelected)) {
      options.series.push({
        name: "Dones",
        data: serieValue.map(s => Math.trunc(s * 1.2)) //TODO: Replace for real data
      });
    }
  }

  GenderSelected.subscribe(value => {
    if (data) {
      updateOption(data);
      chart.updateOptions(options);
    }
  });

  ABSChartFilter.subscribe(filterValue => {
    if (data) {
      updateValue(originalSeriesValue);
      chart.updateOptions(options);
    }
  });
</script>

<Card svgElementId="barchart">

  <div slot="filter">
    <ABSFilters />
  </div>

  <Table bind:ABSSelected bind:dialog />

  <div id="barchart" />

</Card>
