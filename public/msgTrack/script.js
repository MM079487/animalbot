Chart.register(ChartDataLabels);

var firstMessageBox = document.getElementById("firstMessage")
var lastMessageBox = document.getElementById("lastMessage")
const ctx = document.getElementById('chart');

// messages + voice joins are fetched together so both lines share the same chart / x-axis
Promise.all([
    fetch('dailyMessageCount.json').then((response) => response.json()),
    // if the voice endpoint fails, the message line should still show
    fetch('dailyVoiceCount.json').then((response) => response.ok ? response.json() : {}).catch(() => ({}))
])
    .then(([messageData, voiceData]) => {

        // union of all days, oldest -> newest (labels look like "10/25/2026")
        const labels = [...new Set([...Object.keys(messageData), ...Object.keys(voiceData)])]
            .sort((a, b) => new Date(a) - new Date(b));

        const messagePoints = labels.map(day => messageData[day] ?? 0);
        const voicePoints = labels.map(day => voiceData[day] ?? 0);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Number of messages',
                        data: messagePoints,
                        borderWidth: 5,
                        borderColor: "red",
                        tension: 0.4,
                        datalabels: {
                            align: "top"
                        }
                    },
                    {
                        label: 'Voice channel joins',
                        data: voicePoints,
                        borderWidth: 5,
                        borderColor: "#00bfff",
                        tension: 0.4,
                        datalabels: {
                            align: "bottom"
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        text: "Daily Messages & Voice Joins Track",
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

fetch('/chartData')// remember to change: /chartData
    .then((response) => response.status === 200 ? response.json() : null)
    .then(async data => {
        if (!data) return
        let firstData = data[0]
        let lastData = data[1]

        //https://cdn.discordapp.com/avatars/724335188271955979/c7837230ad8f1dbac54e5df7e4d76571?size=1024 (my pfp for test

        console.log(firstData, lastData)
        firstMessageBox.innerHTML = `
                <u style="font-weight: bold;">First Message</u>
                <div class="insideBox">
                    <div class="authorPfp">
                        <img id="authorPfpImg"
                            src="${firstData.iconURL}"
                            style="border-radius: 50%;width: 40px;">
                        <div class="authorName">${firstData.author || "placeholder"}</div>
                    </div>
                    <div class="message">${firstData.content || "placeholder"}</div>
                </div>
        `

        lastMessageBox.innerHTML = `
                <u style="font-weight: bold;">Last Message</u>
                <div class="insideBox">
                    <div class="authorPfp">
                        <img id="authorPfpImg"
                            src="${lastData.iconURL}"
                            style="border-radius: 50%;width: 40px;">
                        <div class="authorName">${lastData.author || "placeholder"}</div>
                    </div>
                    <div class="message">${lastData.content || "placeholder"}</div>
                </div>
`
    })