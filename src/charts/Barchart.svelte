<script>
  import { onMount } from "svelte";
  import Table from "./Table.svelte";
  import {
    ABSChartFilter,
    Gender,
    GenderSelected,
    ColorGender
  } from "../store.js";

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
            ABSSelected.NOMAGA = ABSSelected.NOMABS =
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
  let ABSSelected = {
    NOMABS: "",
    NOMAGA: ""
  };
  let data = null;
  let chart = null;
  let originalSeriesValue = null;

  onMount(async () => {
    const fetched = await fetch(
      "https://gist.githubusercontent.com/damianpumar/f5110a8cf1c2a99408a4cc40235e6790/raw/c7cfcac7a10a2cf25359454756fcd6c82763d7c8/barchart"
    );

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

<Table bind:ABSSelected bind:dialog />
<div id="barchart" />
