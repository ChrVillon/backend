/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Organic',
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [43, 48, 40, 54, 67, 73, 70],
        fill: false,
      },
      {
        label: 'Paid',
        fill: false,
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: '#7e3af2',
        borderColor: '#7e3af2',
        data: [24, 50, 64, 74, 52, 51, 65],
      },
    ],
  },
  options: {
    responsive: true,
    /**
     * Default legends are ugly and impossible to style.
     * See examples in charts.html to add your own legends
     *  */
    legend: {
      display: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Month',
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value',
        },
      },
    },
  },
}

// change this to the id of your chart element in HMTL
const lineCtx = document.getElementById('line')
window.myLine = new Chart(lineCtx, lineConfig)

const countCommentsByDate = (data) => {
  const dateIntervals = {};
  const countsByInterval = {
    "0 a.m. - 8 a.m.": [],
    "8 a.m. - 16 p.m.": [],
    "16 p.m. - 0 a.m.": [],
  };
  Object.values(data).forEach(record => {
    const savedTime = record.saved;
    if (!savedTime) {
      return;
    }
    console.log("Line. savedTime: ", savedTime);
    const formattedTime = savedTime
      .replace(/\s*a\.\s*m\./i, ' AM')
      .replace(/\s*p\.\s*m\./i, ' PM');
    console.log("Line. formattedTime: ", formattedTime);
    const match = formattedTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)/);
    if (!match) {
      console.error("Formato de fecha no reconocido:", savedTime);
      return;
    }
    let [, day, month, year, hour, minute, second, period] = match;
    day = parseInt(day, 10);
    month = parseInt(month, 10);
    year = parseInt(year, 10);
    hour = parseInt(hour, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const dateKey = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
    let intervalKey = "";
    if (hour >= 0 && hour < 8) {
      intervalKey = "0 a.m. - 8 a.m.";
    } else if (hour >= 8 && hour < 16) {
      intervalKey = "8 a.m. - 16 p.m.";
    } else {
      intervalKey = "16 p.m. - 0 a.m.";
    }
    if (!dateIntervals[dateKey]) {
      dateIntervals[dateKey] = {
        "0 a.m. - 8 a.m.": 0,
        "8 a.m. - 16 p.m.": 0,
        "16 p.m. - 0 a.m.": 0,
      };
    }
    dateIntervals[dateKey][intervalKey]++;
  });

  const sortedDates = Object.keys(dateIntervals).sort((a, b) => {
    const toComparable = (date) => {
      const [dd, mm, yy] = date.split("/");
      return `${yy}${mm}${dd}`;
    };
    return toComparable(a) - toComparable(b);
  });
  if (sortedDates.length > 0) {
    countsByInterval["0 a.m. - 8 a.m."] = sortedDates.map((date) => dateIntervals[date]["0 a.m. - 8 a.m."]);
    countsByInterval["8 a.m. - 16 p.m."] = sortedDates.map((date) => dateIntervals[date]["8 a.m. - 16 p.m."]);
    countsByInterval["16 p.m. - 0 a.m."] = sortedDates.map((date) => dateIntervals[date]["16 p.m. - 0 a.m."]);
  }
  return { labels: sortedDates, countsByInterval };
}

update = () => {
  fetch('/api/v1/landing')
    .then((response) => response.json())
    .then((data) => {
      const { labels, countsByInterval } = countCommentsByDate(data);

      // Actualizar el gráfico con nuevas etiquetas y datos
      window.myLine.data.labels = labels;
      window.myLine.data.datasets = [
        {
          label: "0 a.m. - 8 a.m.",
          backgroundColor: "#0694a2",
          borderColor: "#0694a2",
          data: countsByInterval["0 a.m. - 8 a.m."],
          fill: false,
        },
        {
          label: "8 a.m. - 16 p.m.",
          backgroundColor: "#1c64f2",
          borderColor: "#1c64f2",
          data: countsByInterval["8 a.m. - 16 p.m."],
          fill: false,
        },
        {
          label: "16 p.m. - 0 a.m.",
          backgroundColor: "#7e3af2",
          borderColor: "#7e3af2",
          data: countsByInterval["16 p.m. - 0 a.m."],
          fill: false,
        },
      ];
      window.myLine.update();
    })
    .catch((error) => console.error('Error:', error));
}

update();
