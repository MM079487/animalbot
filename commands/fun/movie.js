const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("movie")
    .setDescription("watch free movie")
    .addStringOption(option =>
      option.setName("name")
            .setDescription("Movie title")
            .setRequired(true)
      ),
  async execute(interaction, client){
    const fetch = require("node-fetch")
    const movieInput = interaction.options.getString("name")

    await interaction.deferReply()

    fetch(`https://imdb-api.projects.thetuhin.com/search?query=${movieInput}`)
      .then((response) => response.json())
      .then((data) => {
        try {
          
          let results = data.results
          let date = new Date();
          for (let i = 0; i < results.length; i++) {
            result = results[i]
            if(result.type == "movie" && result.year <= date.getFullYear()){
              const movieEmbed = new EmbedBuilder()
                .setTitle(result.title)
                .setURL(`https://embed.smashystream.com/playere.php?imdb=${result.id}`)
                .setThumbnail(result.image)
                .setDescription(`${result.year || "IDK"}`)
                .setColor(0x1071FF)
              interaction.channel.send({ embeds: [movieEmbed] })

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