<script>
  import { Line } from "svelte-chartjs";
  import { theme } from "$stores/store.js";
  export let inputData = [];
  export let axisXTitle;
  export let axisYTitle;

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  } from "chart.js";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  );

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const transformData = (input, isDarkMode) => {
    const labels = input.map((item) => item.label);
    const data = input.map((item) =>
      parseFloat(item.value.match(/\d+(\.\d+)?/g)[0])
    );
    const pointColors = input.map((item) =>
      hexToRgba(item.color || "#EB3678", isDarkMode ? 0.82 : 0.5)
    );

    return {
      labels: labels,
      datasets: [
        {
          fill: true,
          lineTension: 0.3,
          backgroundColor: hexToRgba("#EB3678", isDarkMode ? 0.15 : 0.3),
          borderColor: hexToRgba("#CD829E", isDarkMode ? 0.7 : 0.5),
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: pointColors,
          pointBackgroundColor: pointColors,
          pointBorderWidth: 10,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(0, 0, 0, 0.8)",
          pointHoverBorderColor: hexToRgba("#CD829E", 0.8),
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 8,
          data: data,
        },
      ],
    };
  };

  $: chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
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
          drawBorder: true,
          drawOnChartArea: true,
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
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
        ticks: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          drawBorder: true,
          drawOnChartArea: true,
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  $: chartData = transformData(inputData, $theme === "dark");
</script>

<Line
  data={chartData}
  options={chartOptions}
  style="width: 340px; height: 300px;"
/>
