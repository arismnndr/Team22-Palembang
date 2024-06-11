let allData = [];

// Fungsi untuk mengimpor dan memproses data
async function fetchData() {
  const response = await fetch('data.json');
  const data = await response.json();
  allData = data.filter(order => order.size === 'XL' || order.size === 'XXL'); // Menyaring data untuk ukuran XL dan XXL
  return allData;
}
// Fungsi untuk memvalidasi tanggal
function parseDate(dateString) {
  const [month, day, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function isValidNumber(value) {
  return !isNaN(value) && isFinite(value);
}

// Fungsi untuk mendapatkan warna berdasarkan ukuran
function getColorForSize(sizeFilter) {
  if (sizeFilter === 'XXL') {
    return "rgba(255, 195, 0, 0.9)";  // Kuning untuk XXL
  } else if (sizeFilter === 'XL') {
    return "rgba(255, 0, 0, 0.8)";  // Merah untuk XL
  } else {
    return "rgba(255, 0, 0, 0.8)";  // Warna default
  }
}

// Fungsi untuk memvisualisasikan data
async function visualizeData(sizeFilter = "", startDate = "", endDate = "") {
  const jsonData = allData.filter(order => {
    const orderDate = parseDate(order.date);
    const matchesSize = sizeFilter ? order.size === sizeFilter : true;
    const matchesStartDate = startDate ? isValidDate(orderDate) && orderDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? isValidDate(orderDate) && orderDate <= new Date(endDate) : true;
    return matchesSize && matchesStartDate && matchesEndDate;
  });

  console.log("Filtered Data:", jsonData);

  const sizes = {};
  let totalOrders = 0; // jumlah order
  let totalQuantity = 0; // jumlah total berdasarkan quantity
  let totalIncome = 0;
  let totalPizzas = 0;

  jsonData.forEach(order => {
    const quantity = parseInt(order.quantity, 10);
    const income = parseFloat(order.income);

    if (isValidNumber(quantity) && isValidNumber(income)) {
      totalOrders += 1; // Menambah jumlah order
      totalQuantity += quantity; // Menambah quantity
      totalIncome += income;
      totalPizzas += quantity;
    }

    if (sizes[order.size]) {
      sizes[order.size] += quantity;  // Menggunakan quantity daripada hanya menghitung order
    } else {
      sizes[order.size] = quantity;  // Menggunakan quantity daripada hanya menghitung order
    }
  });

  const avgPizzaPerOrder = totalOrders ? (totalPizzas / totalOrders).toFixed(2) : 0;
  const avgOrderValue = totalOrders ? (totalIncome / totalOrders).toFixed(2) : 0;

  document.getElementById('number-of-orders').innerText = isValidNumber(totalOrders) ? totalOrders : '0';
  document.getElementById('total-revenue').innerText = isValidNumber(totalIncome) ? `$${totalIncome.toFixed(2)}` : '$0.00';
  document.getElementById('avg-pizza-per-order').innerText = isValidNumber(avgPizzaPerOrder) ? avgPizzaPerOrder : '0';
  document.getElementById('avg-order-value').innerText = isValidNumber(avgOrderValue) ? avgOrderValue : '0';
  document.getElementById('count-of-pizza-sizes').innerText = Object.keys(sizes).length;

  const sizeLabels = Object.keys(sizes);
  const sizeData = Object.values(sizes);
  const totalOrdersCount = sizeData.reduce((acc, count) => acc + count, 0);
  const sizePercentages = sizeData.map(count => ((count / totalOrdersCount) * 100).toFixed(2));

  const ctx = document.getElementById("myChart")?.getContext("2d");
  const ctp = document.getElementById("pieChart")?.getContext("2d");
  const ctxBar = document.getElementById("barChart")?.getContext("2d");

  // Clear existing charts if any
  if (window.barChart && typeof window.barChart.destroy === 'function') window.barChart.destroy();
  if (window.pieChart && typeof window.pieChart.destroy === 'function') window.pieChart.destroy();
  if (window.barChart3 && typeof window.barChart3.destroy === 'function') window.barChart3.destroy();

  window.barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "Quantity",
          data: sizeData,
          backgroundColor: sizeLabels.map(label => getColorForSize(label)),
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


window.pieChart = new Chart(ctp, {
    type: "pie",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "Percentage",
          data: sizePercentages,
          backgroundColor: sizeLabels.map(label => getColorForSize(label)),
          borderWidth: 1,
        },
      ],
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw || 0;
                        return `Percentage: ${value}%`;
                    },
                },
            },
        },
    },
});


  window.barChart3 = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "Quantity",
          data: sizeData,
          backgroundColor: sizeLabels.map(label => getColorForSize(label)),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            display: false
          }
        },
      },
    },
  });

  // Update barChart2 and lineChart
  createCharts(jsonData, sizeFilter);
}

function processChartData(data) {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  let quantityData = new Array(12).fill(0);
  let incomeData = new Array(12).fill(0);

  data.forEach(order => {
    const date = parseDate(order.date);
    if (isValidDate(date)) {
      const month = date.getMonth();
      const quantity = parseInt(order.quantity, 10);
      const income = parseFloat(order.income);

      if (isValidNumber(quantity) && isValidNumber(income)) {
        quantityData[month] += quantity;
        incomeData[month] += income;
      }
    }
  });
  return { months, quantityData, incomeData };
}

function createCharts(data, sizeFilter = "") {
  const { months, quantityData, incomeData } = processChartData(data);

  const cty = document.getElementById("barChart2")?.getContext("2d");
  const ctz = document.getElementById("lineChart")?.getContext("2d");

  if (window.barChart2 && typeof window.barChart2.destroy === 'function') window.barChart2.destroy();
  if (window.lineChart && typeof window.lineChart.destroy === 'function') window.lineChart.destroy();
  
  window.barChart2 = new Chart(cty, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Quantity",
          data: quantityData,
          borderWidth: 1,
          backgroundColor: getColorForSize(sizeFilter),
          borderColor: getColorForSize(sizeFilter), 
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

  window.lineChart = new Chart(ctz, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData, 
          borderWidth: 1,
          backgroundColor: getColorForSize(sizeFilter),
          borderColor: getColorForSize(sizeFilter),
        },
      ],
    },
    options: {
      scales: {
        y: {
          stacked: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw || 0;
              return `Income: $${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

fetchData().then(() => {
  visualizeData();
});

// Menambahkan event listener untuk filter ukuran
document.getElementById('size').addEventListener('change', (event) => {
  const selectedSize = event.target.value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  console.log("Selected Size:", selectedSize);
  console.log("Selected Start Date:", startDate);
  console.log("Selected End Date:", endDate);
  visualizeData(selectedSize, startDate, endDate);
});

// Menambahkan event listener untuk filter tanggal mulai
document.getElementById('startDate').addEventListener('change', (event) => {
  const startDate = event.target.value;
  const endDate = document.getElementById('endDate').value;
  const selectedSize = document.getElementById('size').value;
  console.log("Selected Start Date:", startDate);
  console.log("Selected End Date:", endDate);
  console.log("Selected Size:", selectedSize);
  visualizeData(selectedSize, startDate, endDate);
});

// Menambahkan event listener untuk filter tanggal akhir
document.getElementById('endDate').addEventListener('change', (event) => {
  const endDate = event.target.value;
  const startDate = document.getElementById('startDate').value;
  const selectedSize = document.getElementById('size').value;
  console.log("Selected End Date:", endDate);
  console.log("Selected Start Date:", startDate);
  console.log("Selected Size:", selectedSize);
  visualizeData(selectedSize, startDate, endDate);
});
