const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("urban")
  .setDescription("search words using Urban Dictionary API")
  .addStringOption(option =>
    option.setName("word")
          .setDescription("word that you want to search on Urban Dictionary")
          .setRequired(true)
    ),
  execute(interaction, client) {

    const fetch = require("node-fetch")
    const url = "https://urban-dictionary-api.0xN1nja.repl.co/api?word="
    const wordInput = interaction.options.getString("word")

    interaction.deferReply()

    try {
      fetch(url + wordInput)
        .then((response) => response.json())
        .then((data) => {
          if (data.meaning == `We Couldn't Find ${data.word}`) {
            const errorEmbed = new EmbedBuilder()
              .setTitle("Could't Find " + data.word)
              .setColor(0xff0000)

            return interaction.editReply({ embeds: [errorEmbed], ephemeral: true })
          }

          
          let example;
          if (data.example == "") {
            example = "-"
          } else {
            example = data.example
          }

          const embed = new EmbedBuilder()
            .setTitle(data.word)
            .setDescription("```" + data.meaning + "```")
            .setColor(0x1071FF)
            .addFields({ name: "Example:", value: example })
            .setFooter({ text: `${data.author} - ${data.date} [Urban Dictionary]` })

          interaction.editReply({ content: "", embeds: [embed] })
        })
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Unknow error: " + err)
        .setColor(0xff0000)

      return interaction.editReply({ embeds: [errorEmbed], ephemeral: true })
    }
  }
}