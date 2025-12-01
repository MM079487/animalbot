const { EmbedBuilder } = require("discord.js")
const fs = require("fs")
const { postTime } = require("../server.js")
require('dotenv').config()

const autoShow4DResult = (client) => {
    fetch("https://4dresult88.com/fetchall")
        .then((response) => response.json())
        .then((data) => {
            try {
                let sValues;
                let cValues;

                sValues = fillSValues(data.M4D, 13)
                cValues = fillCValues(data.M4D, 10)
                const MEmbed = new EmbedBuilder()//M4D, s*13, c*10
                    .setTitle(`萬能 4D Results`)
                    .setDescription(`
                        ***头奖：${data.M4D.P1}***\n***二奖: ${data.M4D.P2}***\n***三奖: ${data.M4D.P3}***
                        `)
                    .addFields(
                        { name: "特别奖", value: `${sValues}`, inline: true },
                        { name: "安慰奖", value: `${cValues}`, inline: true }
                    )
                    .setColor("Gold")
                    .setFooter({ text: `日期：${data.M4D.DD}`})

                sValues = fillSValues(data.DMC4D, 10)
                cValues = fillCValues(data.DMC4D, 10)
                const DMCEmbed = new EmbedBuilder()//DMC4D, s*10, c*10
                    .setTitle(`大馬彩 4D Results`)
                    .setDescription(`
                        ***头奖：${data.DMC4D.P1}***\n***二奖: ${data.DMC4D.P2}***\n***三奖: ${data.DMC4D.P3}***
                        `)
                    .addFields(
                        { name: "特别奖", value: `${sValues}`, inline: true },
                        { name: "安慰奖", value: `${cValues}`, inline: true }
                    )
                    .setColor("Blue")
                    .setFooter({ text: `日期：${data.DMC4D.DD}`})

                sValues = fillSValues(data.TT, 13)
                cValues = fillCValues(data.TT, 10)
                const TTEmbed = new EmbedBuilder()//TT, s*13, c*10
                    .setTitle(`TOTO 4D Results`)
                    .setDescription(`
                        ***头奖：${data.TT.P1}***\n***二奖: ${data.TT.P2}***\n***三奖: ${data.TT.P3}***
                        `)
                    .addFields(
                        { name: "特别奖", value: `${sValues}`, inline: true },
                        { name: "安慰奖", value: `${cValues}`, inline: true }
                    )
                    .setColor("Red")
                    .setFooter({ text: `日期：${data.TT.DD}`})


                client.channels.cache.get(`${process.env.channelId}`).send({ embeds: [MEmbed, DMCEmbed, TTEmbed] });
            } catch (err) {
                console.log(err)
            }
        })


}

function fillSValues(data, length) {
    let v = "";
    for (let i = 1; i <= length; i++) {
        v += `${data[`S${i}`]}\n`
    }

    return v;
}

function fillCValues(data, length) {
    let v = "";
    for (let i = 1; i <= length; i++) {
        v += `${data[`C${i}`]}\n`
    }

    return v;
}

module.exports = { autoShow4DResult }