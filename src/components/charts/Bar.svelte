<script>
  import { Bar } from "svelte-chartjs";
  import { theme } from "$stores/store.js";
  export let inputData = [];
  export let axisXTitle;
  export let axisYTitle;

  import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from "chart.js";

  Chart.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  );

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function transformData(input, isDarkMode) {
    const labels = input.map((item) => item.label);
    const data = input.map((item) =>
      parseFloat(item.value.match(/\d+(\.\d+)?/g)[0])
    );
    const backgroundColor = input.map((item) => item.color || "#EB3678");

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColor.map((color) =>
            hexToRgba(color, isDarkMode ? 0.82 : 0.5)
          ),
          borderColor: backgroundColor,
          borderWidth: 2,
        },
      ],
    };
  }

  $: chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        title: {
          display: true,
          text: axisXTitle,
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)",
        },
        ticks: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          drawBorder: true,
        },
      },
      y: {
        title: {
          display: true,
          text: axisYTitle,
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)",
        },
        beginAtZero: true,
        ticks: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          drawBorder: true,
        },
      },
    },
  };

  $: chartData = transformData(inputData, $theme === "dark");
</script>

<Bar
  data={chartData}
  options={chartOptions}
  style="width: 320px; height: 300px;"
/>
