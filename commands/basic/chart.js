const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require("discord.js")
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels')
const { getCounts } = require('../../dailyCounts')
const voiceCounts = require('../../voiceCounts')

Chart.register(ChartDataLabels);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chart")
        .setDescription("Get daily messages chart url"),
    async execute(interaction, client) {

        try {
            await interaction.deferReply()
        } catch (err) {
            // interaction expired or was already answered – nothing to reply to, don't crash the bot
            return console.warn("/chart: could not defer reply:", err.code || err.message)
        }

        try {
            async function generateChart() {
                const width = 1920/2;
                const height = 1080/2;
                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');

                const [data, voiceData] = await Promise.all([getCounts(), voiceCounts.getCounts()]);

                // union of all days, oldest -> newest (same logic as the website)
                const labels = [...new Set([...Object.keys(data), ...Object.keys(voiceData)])]
                    .sort((a, b) => new Date(a) - new Date(b));
                const dataPoints = labels.map(day => data[day] ?? 0);
                const voicePoints = labels.map(day => voiceData[day] ?? 0);

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Number of messages',
                                data: dataPoints,
                                borderWidth: 5,
                                borderColor: "red",
                                tension: 0.4,
                                datalabels: { align: "top" }
                            },
                            {
                                label: 'Voice channel joins',
                                data: voicePoints,
                                borderWidth: 5,
                                borderColor: "#00bfff",
                                tension: 0.4,
                                datalabels: { align: "top" }
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        animation: false,
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

                // in-memory image (no shared chart.png on disk)
                return canvas.toBuffer('image/png');
            }

            const buffer = await generateChart();
            const attachment = new AttachmentBuilder(buffer, { name: "chart.png" });

            const embed = new EmbedBuilder()
                .setTitle("Chart URL")
                .setDescription(`${process.env.WEBSITE_URL}/chart/`)
                .setColor("Green")

            await interaction.editReply({ embeds: [embed], files: [attachment] })
        } catch (err) {
            console.error("❌ /chart failed:", err)
            await interaction.editReply({ content: "Couldn't generate the chart, try again in a moment.", embeds: [], files: [] }).catch(() => {})
        }
    }
}
