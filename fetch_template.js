const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("uhhh...")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute(interaction, client){
    const fetch = require("node-fetch")
    const url = " "

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        try {
          console.log(data)
        } catch (err) {
          console.log(err)
        }
      })

  }
}