const { EmbedBuilder } = require("discord.js")
const fs = require("fs")
const { postTime } = require("../server.js")
require('dotenv').config()

const autoCountdown = (client) => {
    let rawdata = fs.readFileSync('countdowns.json');
    let countdownsJson = JSON.parse(rawdata);
    
    Object.entries(countdownsJson).forEach(([key, value]) => {
    const targetDate = new Date(value.date)
    const dateNow = new Date();
    const diffTime = Math.abs(dateNow - targetDate);

    if (targetDate.getTime() < dateNow.getTime()){ //passed time
      delete countdownsJson[key]
      fs.writeFile("countdowns.json", JSON.stringify(countdownsJson), (err) => {
        if (err) console.log(err)
      })
      console.log(`${key} deleted`)
      return true
    }

    function dhm(t){
        var cd = 24 * 60 * 60 * 1000,
            ch = 60 * 60 * 1000,
            d = Math.floor(t / cd),
            h = Math.floor( (t - d * cd) / ch),
            m = Math.round( (t - d * cd - h * ch) / 60000),
            pad = function(n){ return n < 10 ? '0' + n : n; };
      if( m === 60 ){
        h++;
        m = 0;
      }
      if( h === 24 ){
        d++;
        h = 0;
      }
      return `${d} days ${pad(h)} hours and ${pad(m)} minutes`;
    }
        const embed = new EmbedBuilder()
        .setTitle(`${key.toUpperCase()} Countdown`)
        .setDescription(`\`${dhm(diffTime)} left \`\nhttps://animal-bot-5hs7.onrender.com/countdown`)
        .setColor("Random")

        client.channels.cache.get(`${process.env.channelId}`).send({ embeds:[embed] });
        postTime(`Bot sent countdown message`);
  })
}

module.exports = { autoCountdown }