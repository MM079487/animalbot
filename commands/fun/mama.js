const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mama")
    .setDescription("Get Joe Mama jokes using yomomma api"),
  /** 
  
   @param
  */
  execute(interaction, client){
    const { EmbedBuilder } = require("discord.js")
    const fetch = require("node-fetch")
    const url = "https://api.yomomma.info"
    
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        try {
          const embed = new EmbedBuilder()
            .setTitle("Joe Mama Jokes")
            .setDescription(data.joke)
            .setColor(0x00FFF9)

          interaction.reply({ embeds: [embed] })

        } catch (err) {
          console.log(err)
        }
      })

  }
}