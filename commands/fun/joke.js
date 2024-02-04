const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
module.exports = {
  data: new SlashCommandBuilder()
  .setName("joke")
  .setDescription("get jokes using JokeApi")
	.addStringOption(option =>
		option.setName('category')
			.setDescription('The jokes category')
			.addChoices(
				{ name: 'programming', value: 'programming' },
				{ name: 'misc', value: 'misc' },
				{ name: 'dark', value: 'dark' },
        { name: 'pun', value: 'pun' },
        { name: 'spooky', value: 'spooky' },
        { name: 'christmas', value: 'christmas' },
			)),
  async execute(interaction, client) {
    const category = interaction.options.getString("category")
    const fetch = require("node-fetch")
    let cat;
    let url;

    if(category){
      switch (category) {
        case "programming":
          cat = "Programming"
          break;
  
        case "misc":
          cat = "Miscellaneous"
          break;
  
        case "dark":
          cat = "Dark"
          break;
  
        case "pun":
          cat = "Pun"
          break;
  
        case "spooky":
          cat = "spooky"
          break;
  
        case "christmas":
          cat = "Christmas"
          break;
  
      }
      url = `https://v2.jokeapi.dev/joke/${cat}`
    }else{
      url = `https://v2.jokeapi.dev/joke/Any`
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        try {

          if(data.type == "single"){
            const singleEmbed = new EmbedBuilder()
              .setTitle("Jokes")
              .setDescription(data.joke)
              .setColor(0xC400FF)
              .setFooter({ text: `Category: ${data.category}` })
  
            interaction.reply({ embeds: [singleEmbed] })
          }else{
             const twoPartEmbed = new EmbedBuilder()
            .setTitle("Jokes")
            .setDescription(`${data.setup}\n ||${data.delivery}||`)
            .setColor(0xC400FF)
            .setFooter({ text: `Category: ${data.category}` })

            interaction.reply({ embeds:[twoPartEmbed] })
          }
        

        } catch (err) {
          console.log(err)
        }
      })

  }
}