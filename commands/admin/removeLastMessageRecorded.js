const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const { deleteLast } = require("../../index.js")
const { postTime } = require("../../server.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove_last_msg")
    .setDescription("admin magic")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client){
    await interaction.deferReply()
    deleteLast()
    interaction.editReply({ content:"Last recorded message deleted", ephemeral: true})
    postTime(`${interaction.user.username} deleted last recorded message`)
  }
}