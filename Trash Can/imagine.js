const { Configuration, OpenAIApi } = require("openai");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("imagine")
    .setDescription("generate an image using openAI API")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("The message that you want to send to AI and generate an image")
        .setRequired(true)),

  async execute(interaction, client) {
    const message = interaction.options.getString("message")
    await interaction.deferReply();

    const configuration = new Configuration({
      apiKey: process.env.openAIKey,
    });

    const openai = new OpenAIApi(configuration);

    try {
      const response = await openai.createImage({
        prompt: message,
        n: 4,
        size: "1024x1024",
      });

      image_url = response.data.data;

      const embed1 = new EmbedBuilder()
        .setURL("https://labs.openai.com/")
        .setImage(image_url[0].url)
        .setColor("Green")
        .setFooter({ text: "using openAI API" })

      const embed2 = new EmbedBuilder()
        .setURL("https://labs.openai.com/")
        .setImage(image_url[1].url)

      const embed3 = new EmbedBuilder()
        .setURL("https://labs.openai.com/")
        .setImage(image_url[2].url)

      const embed4 = new EmbedBuilder()
        .setURL("https://labs.openai.com/")
        .setImage(image_url[3].url)

      interaction.editReply({ content:"***You: " + message + "***", embeds: [embed1, embed2, embed3, embed4] })
    } catch (err) {
      if(err.response.status == 400){
        const banWordEmbed = new EmbedBuilder()
        .setTitle("Seems like you have just sent some banned word.... What are you trying to send 🤔...")
        .setColor("Red")

        interaction.editReply({ embeds: [banWordEmbed] })
        return
      }
      const errEmbed = new EmbedBuilder()
        .setTitle("Bro u make me error")
        .setDescription(`\`\`\`${err}\`\`\``)
        .setColor("Red")

      interaction.editReply({ embeds: [errEmbed] })
    }





  }
}