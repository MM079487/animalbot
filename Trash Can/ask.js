const { Configuration, OpenAIApi } = require("openai");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("ask a question to AI using openAI API")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("The message that you want to send to AI")
        .setRequired(true)),

  async execute(interaction, client) {
    const message = interaction.options.getString("message")
    await interaction.deferReply();

    const configuration = new Configuration({
      apiKey: process.env.openAIKey,
    });

    const openai = new OpenAIApi(configuration);

    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        max_tokens: 1000,
        prompt: message,
      });

      const embed = new EmbedBuilder()
        .setTitle("You: " + message)
        .setDescription("```" + completion.data.choices[0].text + "```")
        .setColor("Green")
        .setFooter({ text: "using openAI API" })
  
      interaction.editReply({ embeds: [embed] })
    }catch(err){
      const errEmbed = new EmbedBuilder()
      .setTitle("Bro u make me error")
      .setDescription(`\`\`\`${err}\`\`\``)
      .setColor("Red")
      
      interaction.editReply({ embeds:[errEmbed] })
    }
  
  
    


  }
}