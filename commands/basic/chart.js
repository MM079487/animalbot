const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require("discord.js")
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const fs = require('fs');
const ChartDataLabels = require('chartjs-plugin-datalabels')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chart")
        .setDescription("Get daily messages chart url"),
    async execute(interaction, client) {

        await interaction.deferReply()

        async function generateChart() {
            const width = 1920/2;
            const height = 1080/2;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            let data = JSON.parse(fs.readFileSync("public/msgTrack/dailyMessageCount.json", "utf8"));

            const labels = Object.keys(data);
            const dataPoints = Object.values(data);

            Chart.register(ChartDataLabels);

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

            // Save the chart as an image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync('chart.png', buffer);
        }
        await generateChart(); // Generate chart image
        const attachment = new AttachmentBuilder('chart.png'); // Attach image

        const embed = new EmbedBuilder()
            .setTitle("Chart URL")
            .setDescription(`https://animal-bot-5hs7.onrender.com/chart/`)
            .setColor("Green")

        await interaction.editReply({ embeds: [embed], files: [attachment] })

    }
}