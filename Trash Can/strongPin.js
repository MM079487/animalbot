const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
let sentMsg;
let input = false;
let isPinned = false;
let debounce = false;

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("strong_pin")
    .setDescription("pin a message but A BIT stronger than built-in pin")
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("remove what you pinned")
        .addStringOption((option) =>
          option.setName("message_id")
            .setDescription("The message id to pin")
            .setRequired(true),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("remove")
        .setDescription("remove what you pinned"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {

    const subCommand = interaction.options.getSubcommand()


    if (subCommand == "remove") {
      if (isPinned == false) return interaction.reply({ content: "No message is strong pinned", ephemeral: true })
      isPinned = false
      sentMsg = false
      input = false

      // this.client.once.removeListener('messagCreate', callback);
      if (sentMsg) {
        sentMsg.delete()
      }
      interaction.reply({ content: "Pinned message removed", ephemeral: true })
      return true
    }

    if (isPinned == true) return interaction.reply({ content: "There have another pinned message!", ephemeral: true })

    const messageId = interaction.options.getString("message_id")
    await interaction.channel.messages.fetch(messageId)
      .then(msg => input = msg.content)
      .catch(err => console.log(err))
    if (input == false) return interaction.reply({ content: "Error...", ephemeral: true })

    interaction.reply({ content: "message sent!", ephemeral: true })
    let channel = interaction.channel
    sentMsg = await interaction.channel.send({ embeds: [new EmbedBuilder().setDescription(input).setColor("Green")] })
    isPinned = true

    
    if(debounce == false){
      debounce = true
      client.on("messageCreate", async message => {
        if (message.author.bot) return false
        if (sentMsg == false || !sentMsg) return false
        if (message.channel.id != channel.id) return false
        await sentMsg.delete()
        sentMsg = await interaction.channel.send({ embeds: [new EmbedBuilder().setDescription(input).setColor("Green")] })
      })
      return false
    }
  }
}
