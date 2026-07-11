let lastSeenTime = 0;
const { EmbedBuilder } = require("discord.js")
const fs = require("fs")
const { postTime } = require("../server.js")
require('dotenv').config()

const sendPRNResult = (client) => {

    setInterval(checkAPI, 1000); //update every 30s
    async function checkAPI() {
        const timestamp = Date.now();
        const data = await fetch(`https://data.pru.astroawani.com/data/16/result_state_assembly.json?bust=${timestamp}`).then(r => r.json());
        const tangkak = data.find(seat => seat.seat_id === 'N10');

        if (tangkak.last_published_at !== lastSeenTime) {
            const totalRegistered = tangkak.registered_voters
            const totalVoted = tangkak.candidates[0].vote + tangkak.candidates[1].vote
            const percentage = (totalVoted / totalRegistered) * 100
            //send message
            const embed = new EmbedBuilder()
                .setTitle("[LIVE] N10 Tangkak")
                .setColor("Random")
                .setDescription(`
                地点：[${tangkak.seat_id}] ${tangkak.seat_name}, ${tangkak.state}
                废票： ${tangkak.rejected_votes}
                目前总票数：${totalVoted.toLocaleString()} / ${totalRegistered.toLocaleString()}
                当前投票率：${percentage.toFixed(2)}%
                官方成绩：${tangkak.official_result == true ? "✅" : "❌"}
                更新时间: __${new Date(tangkak.last_published_at).toLocaleString()}__

                `)
                .addFields(
                    {
                        name: "领先",
                        value: `${tangkak.candidates[0].name} ${tangkak.candidates[0].name == "HAW CHIN TECK" ? "🔵" : "🔴"} \n**${tangkak.candidates[0].vote.toLocaleString()}** 票 (领先 *${tangkak.majority}* 票)`,
                        inline: false
                    },
                    {
                        name: "落后",
                        value: `${tangkak.candidates[1].name} ${tangkak.candidates[1].name == "HAW CHIN TECK" ? "🔵" : "🔴"} \n**${tangkak.candidates[1].vote.toLocaleString()}** 票`,
                        inline: false
                    }
                )

            client.channels.cache.get(`${process.env.channelId}`).send({ embeds: [embed] });
            lastSeenTime = tangkak.last_published_at;
        }
    }
}

module.exports = { sendPRNResult }