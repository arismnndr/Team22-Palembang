// index.js

// Function to fetch data from data.json
async function fetchData() {
  const response = await fetch('data.json');
  const data = await response.json();
  return data;
}

// Function to process and visualize data
async function visualizeData() {
  const jsonData = await fetchData();

  // Parse the JSON data and extract necessary information
  const sizes = {};
  jsonData.forEach(order => {
    if (sizes[order.size]) {
      sizes[order.size] += 1;
    } else {
      sizes[order.size] = 1;
    }
  });

  console.log(sizes);

  // {} => []

  const sizeLabels = Object.keys(sizes);
  const sizeData = Object.values(sizes);

  // DOM
  const ctx = document.getElementById("myChart");
  const ctp = document.getElementById("pieChart");

  // Bar Chart
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "# of Orders",
          data: sizeData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          grid: {
            display: false
          }
        },
      },
    },
  });

  // Pie Chart
  new Chart(ctp, {
    type: "pie",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "# of Orders",
          data: sizeData,
          borderWidth: 1,
        },
      ],
    },
  });
}

// Call the function to fetch and visualize data
visualizeData();

function processChartData(data) {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  let quantityData = new Array(12).fill(0);
  let amountData = new Array(12).fill(0);
  
  data.forEach(order => {
    const date = new Date(order.date);
    const month = date.getMonth();
    quantityData[month] += parseInt(order.quantity, 10);
    amountData[month] += parseFloat(order.income);
});
return { months, quantityData, amountData };
}

async function createCharts() {
  const data = await fetchData();
  const { months, quantityData, amountData } = processChartData(data);
  
  const cty = document.getElementById("barChart2");
  const ctz = document.getElementById("lineChart");

// chart4
new Chart(cty, {
  type: "bar",
  data: {
      labels: months,
      datasets: [
          {
              label: "quantity",
              data: quantityData,
              borderWidth: 1,
          },
      ],
  },
  options: {
      indexAxis: 'y',
      scales: {
          x: {
              stacked: true,
          },
          y: {
              stacked: true,
              grid: {
                  display: false
              }
          },
      },
  },
});

// chart5
new Chart(ctz, {
  type: 'line',
  data: {
      labels: months,
      datasets: [
          {
              label: "amount",
              data: amountData,
              borderWidth: 1,
          },
      ],
  },
  options: {
      scales: {
          y: {
              stacked: true
          }
      }
  },
});

}
createCharts();
