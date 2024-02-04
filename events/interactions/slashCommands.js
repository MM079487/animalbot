const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")

module.exports = {
  name:"interactionCreate",
  async execute(interaction, client){
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return interaction.reply({
      content: "Bruh, an error",
      ephemeral: true
    });

    if(command.developer && interaction.user.id != "724335188271955979") return interaction.reply({
      embeds: [new EmbedBuilder().setTitle("This is a developer command, you kenot use this command you this stupid!").setColor("Red")],
      ephemeral: true
    })


    command.execute(interaction, client);
  }
}