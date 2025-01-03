const { EmbedBuilder } = require("discord.js")
const fs = require("fs")

function autoCountdown(client){
  let sentMsg = 0;
  const offset = +8
  setInterval(function() {
    let rawdata = fs.readFileSync('countdowns.json');
    let countdownsJson = JSON.parse(rawdata);

    if(sentMsg >= Object.keys(countdownsJson).length) return true
    
    Object.entries(countdownsJson).forEach(([key, value]) => {
    const targetDate = new Date(value.date)
    const dateNow = new Date( new Date().getTime() + offset * 3600 * 1000)
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
    
    if(dateNow.getHours() == 0){
        const embed = new EmbedBuilder()
        .setTitle(`${key.toUpperCase()} Countdown`)
        .setDescription(`\`${dhm(diffTime)} left \``)
        .setColor("Random")
        
        client.channels.cache.get("974494856099549207").send({ embeds:[embed] })
        sentMsg ++
    }else{
      sentMsg = 0
    }
  })
    
  }, 5000);
}

module.exports = { autoCountdown }