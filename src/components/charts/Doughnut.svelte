<script>
  import { Doughnut } from "svelte-chartjs";
  import { theme } from "$stores/store.js";
  export let inputData = [];

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
  } from "chart.js";

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function lightenColor(hex, percent) {
    let num = parseInt(hex.slice(1), 16);
    let r = Math.min(255, (num >> 16) + percent);
    let g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
    let b = Math.min(255, (num & 0x0000ff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  function transformData(input, isDarkMode) {
    return {
      labels: input.map((item) => item.label),
      datasets: [
        {
          data: input.map((item) =>
            parseFloat(item.value.match(/\d+(\.\d+)?/g)[0])
          ),
          backgroundColor: input.map((item) =>
            hexToRgba(item.color || "#EB3678", isDarkMode ? 0.82 : 0.5)
          ),
          hoverBackgroundColor: input.map((item) =>
            lightenColor(item.color || "#EB3678", 20)
          ),
        },
      ],
    };
  }

  $: chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          boxWidth: 20,
          padding: 10,
          font: {
            size: 14,
          },
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: $theme === "dark" ? "#111214" : "#f2f5ff",
      },
    },
  };

  $: chartData = transformData(inputData, $theme === "dark");
</script>

<Doughnut
  data={chartData}
  options={chartOptions}
  style="width: 320px; height: 300px;"
/>
