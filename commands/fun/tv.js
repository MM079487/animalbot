const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tv")
    .setDescription("watch free tv series")
    .addStringOption(option =>
      option.setName("name")
          .setDescription("tv series title")
          .setRequired(true)
      )
    .addIntegerOption(option=>
      option.setName("season")
        .setDescription("tv series season")
        .setRequired(true)
      )
    .addIntegerOption(option=>
      option.setName("episode")
        .setDescription("tv series episode")
        .setRequired(true)
      ),
  async execute(interaction, client){
    const fetch = require("node-fetch")
    const tvInput = interaction.options.getString("name")
    const seasonInput = interaction.options.getInteger("season")
    const episodeInput = interaction.options.getInteger("episode")

    await interaction.deferReply()

    fetch(`https://imdb-api.projects.thetuhin.com/search?query=${tvInput}`)
      .then((response) => response.json())
      .then((data) => {
        try {

          let results = data.results
          let date = new Date();
          for (let i = 0; i < results.length; i++) {
            result = results[i]
            if(result.type == "tvSeries" && result.year <= date.getFullYear()){
              const tvEmbed = new EmbedBuilder()
                .setTitle(result.title)
                .setURL(`https://embed.smashystream.com/playere.php?imdb=${result.id}&season=${seasonInput}&episode=${episodeInput}`)
                .setThumbnail(result.image)
                .setDescription(`${result.year || "IDK"}`)
                .setColor(0x1071FF)
              interaction.channel.send({ embeds: [tvEmbed] })

            }
          }
              let cautionEmbed = new EmbedBuilder()
              .setTitle("️Caution")
              .setDescription("Clicking play button for first time will show ads, just go back to movie tab")
              .setColor(0x1071FF)
              interaction.editReply({ embeds:[cautionEmbed] })
        } catch (err) {
          console.log(err)
        }
      })

  }
}