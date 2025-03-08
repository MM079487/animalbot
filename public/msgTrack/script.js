Chart.register(ChartDataLabels);

const ctx = document.getElementById('chart');

fetch('dailyMessageCount.json')
    .then((response) => response.json())
    .then(async data => {

        const labels = Object.keys(data);
        const dataPoints = Object.values(data);


        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of messages',
                    data: dataPoints,
                    borderWidth: 5,
                    borderColor: "red",
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        display: true,
                        color: "white",
                        font: { size: 15, weight: "bold" },
                        align: "top",
                        backgroundColor: "#282b30"
                    },
                    title: {
                        display: true,
                        text: "Daily Messages Track",
                        color: "white",
                        font: {
                            size: 24
                        }
                    },
                    legend: {
                        labels: {
                            color: "white"
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: "white"
                        },
                        ticks: {
                            color: "white"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "white"
                        },
                        ticks: {
                            color: "white"
                        }
                    }
                }
            }
        });
    })