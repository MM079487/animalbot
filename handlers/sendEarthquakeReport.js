let lastSeenTime = 0;
const { EmbedBuilder } = require("discord.js")
const fs = require("fs")
const { postTime } = require("../server.js")
require('dotenv').config()

const sendEarthquakeReport = (client) => {

    setInterval(checkAPI, 300000); //update every 5 minutes
    async function checkAPI() {
    const data = await fetch("https://api.data.gov.my/weather/warning/earthquake/?sort=-utcdatetime&limit=2").then(r => r.json());
    const latest = data[0];

        if (latest.utcdatetime !== lastSeenTime) {
            //send message
            const embed = new EmbedBuilder()
            .setTitle("地震报告")
            .setColor("Red")
            .setDescription(`
                地点：${latest.location_original} (${latest.n_distancemas}),
                Google Maps: https://maps.google.com/?q=${latest.lat},${latest.lon},
                震级：${latest.magdefault},
                时间: ${latest.localdatetime}
                `)
            client.channels.cache.get(`${process.env.channelId}`).send({ embeds: [embed] });
            lastSeenTime = latest.utcdatetime;
        }
    }
}

module.exports = { sendEarthquakeReport }