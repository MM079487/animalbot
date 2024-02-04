let debounce = false;
const holidayDate = new Date("May 2 2023")
const { EmbedBuilder } = require("discord.js")

function holidayCountdown(client){
  const offset = +8
  setInterval(function() {
    const dateNow = new Date( new Date().getTime() + offset * 3600 * 1000)
    const diffTime = Math.abs(dateNow - holidayDate);

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
      if(debounce) return
      const embed = new EmbedBuilder()
      .setTitle("Holiday End Countdown")
      .setDescription(`\`${dhm(diffTime)} left \``)
      .setColor("Random")
      
      client.channels.cache.get("974494856099549207").send({ embeds:[embed] })
      debounce = true
    }else{
      debounce = false
    }
  }, 5000);
}

module.exports = { holidayCountdown }