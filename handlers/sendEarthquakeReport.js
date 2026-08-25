let lastSeenTime = 0;
const { EmbedBuilder, AttachmentBuilder } = require("discord.js")
const fs = require("fs")
const { postTime } = require("../server.js")
require('dotenv').config()

const sendEarthquakeReport = (client) => {

    setInterval(checkAPI, 300000); //update every 5 minutes
    async function checkAPI() {
        try {
            const response = await fetch("https://api.data.gov.my/weather/warning/earthquake/?sort=-utcdatetime&limit=2");
            const data = await response.json();
            const latest = data[0];

            if (!latest || latest.utcdatetime === lastSeenTime) return;

            // Move attachment creation inside the conditional check
            const API_KEY = process.env.GOOGLE_MAPS_API;
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latest.lat},${latest.lon}&zoom=10&size=600x400&maptype=hybrid&markers=color:red%7C${latest.lat},${latest.lon}&key=${API_KEY}`;
            const attachment = new AttachmentBuilder(mapUrl, { name: 'satellite-map.png' });

            const embed = new EmbedBuilder()
                .setTitle("地震报告")
                .setColor("Red")
                .setDescription(`
                    地点：${latest.location_original} (${latest.n_distancemas})
                    Google Maps: https://maps.google.com/?q=${latest.lat},${latest.lon}
                    震级：${latest.magdefault}
                    震源深度：${latest.depth}KM
                    时间: ${latest.localdatetime}
                                `)
                .setImage('attachment://satellite-map.png');

            const channel = client.channels.cache.get(process.env.channelId);
            if (channel) {
                await channel.send({ embeds: [embed], files: [attachment] });
                lastSeenTime = latest.utcdatetime;
            }
        } catch (error) {
            console.error("Failed to fetch earthquake API:", error);
        }
    }
}

module.exports = { sendEarthquakeReport }