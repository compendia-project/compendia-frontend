<script>
  import { Scatter } from "svelte-chartjs";
  import { theme } from "$stores/store.js";
  export let inputData = [];
  export let axisXTitle;
  export let axisYTitle;

  import {
    Chart,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    ScatterController,
    PointElement,
  } from "chart.js";

  const lineBetweenPointsPlugin = {
    id: "lineBetweenPoints",
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const yAxis = chart.scales.y;
      const xAxis = chart.scales.x;

      if (!yAxis || !xAxis) return;

      ctx.save();
      ctx.beginPath();

      // Use theme-aware colors directly
      const gridColor = chart.options.isDarkMode
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)";

      // Top boundary line
      ctx.moveTo(xAxis.left, yAxis.top);
      ctx.lineTo(xAxis.right, yAxis.top);

      // Bottom boundary line
      ctx.moveTo(xAxis.left, yAxis.bottom);
      ctx.lineTo(xAxis.right, yAxis.bottom);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },
    afterDraw: (chart) => {
      // Existing line connection logic
      const ctx = chart.ctx;
      const metaStart = chart.getDatasetMeta(0);
      const metaEnd = chart.getDatasetMeta(1);
      const isDarkMode = chart.options.isDarkMode;

      for (let i = 0; i < metaStart.data.length; i++) {
        const startPoint = metaStart.data[i];
        const endPoint = metaEnd.data[i];
        if (!startPoint || !endPoint) continue;

        // Calculate circle edge positions
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const startRadius = startPoint.options.radius;
        const endRadius = endPoint.options.radius;

        const startX = startPoint.x + (dx / distance) * startRadius;
        const startY = startPoint.y + (dy / distance) * startRadius;
        const endX = endPoint.x - (dx / distance) * endRadius;
        const endY = endPoint.y - (dy / distance) * endRadius;

        // Draw connecting line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = isDarkMode
          ? "rgba(255, 255, 255, 0.6)"
          : "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    },
  };

  Chart.register(
    ScatterController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    PointElement,
    lineBetweenPointsPlugin
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
      combinedData.push({
        label: item1.label,
        value: [parseFloat(item1.value), parseFloat(item2.value)],
        unit: item1.unit,
        color: [item1.color, item2.color],
      });
    }
    return combinedData;
  }

  function transformData(input, isDarkMode) {
    const labels = input.map((item) => item.label);
    const combinedData = input;

    return {
      datasets: [
        {
          label: "Start",
          data: combinedData.map((item) => ({
            x: item.value[0],
            y: item.label,
          })),
          backgroundColor: combinedData.map((item) =>
            hexToRgba(item.color[0], isDarkMode ? 0.8 : 0.6)
          ),
          borderColor: combinedData.map((item) => item.color[0]),
          borderWidth: 2,
          pointRadius: 5,
          pointStyle: "circle",
        },
        {
          label: "End",
          data: combinedData.map((item) => ({
            x: item.value[1],
            y: item.label,
          })),
          backgroundColor: combinedData.map((item) =>
            hexToRgba(item.color[1], isDarkMode ? 0.8 : 0.6)
          ),
          borderColor: combinedData.map((item) => item.color[1]),
          borderWidth: 2,
          pointRadius: 5,
          pointStyle: "circle",
        },
      ],
    };
  }

  $: chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        type: "linear",
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
      y: {
        type: "category",
        title: {
          display: true,
          text: axisXTitle,
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)",
        },
        offset: true,
        ticks: {
          color:
            $theme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
          align: "center",

          callback: function (value) {
            const label = this.getLabelForValue(value);
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
            return lines;
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
    isDarkMode: $theme === "dark",
  };

  $: chartData = transformData(combineDataPoints(inputData), $theme === "dark");
</script>

<Scatter
  data={chartData}
  options={chartOptions}
  style="width: 320px; height: 300px;"
/>
