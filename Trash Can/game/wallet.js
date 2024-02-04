const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const userData = require("../../schemas/userData")
const { getUserData } = require("../../functions/getUserData")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("check how much money you got in your wallet"),
  async execute(interaction, client){
    await interaction.deferReply()
    const data =  await getUserData(interaction.user.id)

    if(!data) return await interaction.editReply({
      content:"bro haven't played this game before",
      ephemeral: true
    })
    else{
      const embed = new EmbedBuilder()
      .setAuthor({ name:interaction.user.username, iconURL:interaction.user.displayAvatarURL() })
      .setTitle(`Wallet: $${data.wallet}`)
      .setColor("Green")
      .setFooter({ text: "You know you can earn money by chatting?" })

      await interaction.editReply({ content:"", embeds:[embed] })
    }
  }
}