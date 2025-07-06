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

  function combineDataPoints(data) {
    const combinedData = [];

    for (let i = 0; i < data.length - 1; i++) {
      const item1 = data[i];
      const item2 = data[i + 1];

      // Combine label and unit
      const newLabel = `${item1.label} - ${item2.label}`;
      const newValue = [parseFloat(item1.value), parseFloat(item2.value)];
      const newUnit = item1.unit; // Assuming units are the same

      // Merge colors (can be customized based on your needs)
      const newColor = [item1.color, item2.color];

      combinedData.push({
        label: newLabel,
        value: newValue,
        unit: newUnit,
        color: newColor,
      });
    }

    return combinedData;
  }

  function transformData(input, isDarkMode) {
    const labels = input.map((item) => item.label);

    const data = input.map((item) => {
      return Array.isArray(item.value)
        ? item.value
        : [parseFloat(item.value), parseFloat(item.value)];
    });

    const backgroundColor = input.map((item) => item.color[0] || "#EB3678");

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
    indexAxis: "y", // Makes chart horizontal
    plugins: { legend: { display: false } },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: axisYTitle, // Swapped axis titles
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
      y: {
        type: "category",
        title: {
          display: true,
          text: axisXTitle, // Swapped axis titles
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
          callback: function (value) {
            const label = this.getLabelForValue(value);

            // Split label by words and wrap every ~20 characters
            const words = label.split(" ");
            const lines = [];
            let currentLine = "";

            words.forEach((word) => {
              if ((currentLine + word).length > 20) {
                lines.push(currentLine.trim());
                currentLine = word + " ";
              } else {
                currentLine += word + " ";
              }
            });

            if (currentLine) lines.push(currentLine.trim());

            return lines; // Return an array for multi-line display
          },
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

  $: chartData = transformData(combineDataPoints(inputData), $theme === "dark");
</script>

<Bar
  data={chartData}
  options={chartOptions}
  style="width: 320px; height: 300px;"
/>
