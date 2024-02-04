const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("facts")
    .setDescription("get random facts..."),
  async execute(interaction, client){
    const fetch = require("node-fetch")
    const url = "https://uselessfacts.jsph.pl/api/v2/facts/random"
    
    await interaction.deferReply()
    
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        try {
          const embed = new EmbedBuilder()
          .setTitle("Random Useless Facts")
          .setDescription(`\`\`\`${data.text}\`\`\``)
          .setFooter({ text:"using uselessfacts API" })
          .setColor("Green")

          interaction.editReply({ embeds:[embed] })
        } catch (err) {
          const errEmbed = new EmbedBuilder()
          .setTitle("Error (not my fault)")
          .setDescription(`\`${err}\``)
          .setColor("Red")

          interaction.editReply({ embeds:[errEmbed] })
        }
      })

  }
}