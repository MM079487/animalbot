const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("search")
  .setDescription("search words using Dictionary API")
  .addStringOption(option => 
    option.setName("word")
          .setDescription("word that you want to search")
          .setRequired(true)
    ),
  execute(interaction, client) {
    const fetch = require("node-fetch")
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/"
    let embed
    const word = interaction.options.getString("word")
    

    fetch(url + word)
      .then((response) => response.json())
      .then((data) => {
        const d = data[0]
        try {
          if (!d) return interaction.reply({
              embeds: [new EmbedBuilder().setTitle(data.title).setColor("Red")],
              ephemeral: true
            })
          
          async function buildEmbed() {
            let title = ""
            let value = ""
            let desc = ""


            for (let i = 0; i < d.meanings.length; i++) {
              title = d.meanings[i].partOfSpeech
              let z = i
              for (let x = 0; x < d.meanings[i].definitions.length; x++) {
                value += `\n- ${d.meanings[z].definitions[x].definition}`
              }
              desc += `\n**__${title}__**\`\`\`${value}\`\`\`\n`
              title = ""
              value = ""
            }


            embed = new EmbedBuilder()
              .setDescription(desc)
              .setColor(0x00FFF9)

            const { translate } = require('bing-translate-api');
            await translate(word, null, 'zh-Hans', true).then(res => {
              embed.setTitle(`${d.word} (${res.translation})`)
            })
          }

          async function waitForEmbed() {
            await buildEmbed()
            interaction.reply({ embeds: [embed] })
          }

          waitForEmbed()

        } catch (err) {
          console.log(err)
        }
      })
  }
}