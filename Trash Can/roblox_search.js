const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roblox_search")
    .setDescription("search roblox user by id")
    .addIntegerOption(option =>
      option.setName("user_id")
        .setDescription("Roblox user's id")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const fetch = require("node-fetch")
    const userId = interaction.options.getInteger("user_id")
    let userData;
    let userThumbnail;

    await interaction.deferReply();

    await fetch(`https://users.roblox.com/v1/users/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        try {
          userData = data
        } catch (err) {
          return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("uhm... ERROR!!!").setColor("Red").setDescription(err)] })
        }
      })

    await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`)
      .then((response) => response.json())
      .then((data) => {
        try {
          userThumbnail = data
        } catch (err) {
          return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("uhm... ERROR!!!").setColor("Red").setDescription(err)] })
        }
      })



    console.log(userData)
    console.log(userThumbnail.data[0])
    const embed = new EmbedBuilder()
      .setTitle(`${userData.displayName}\n@${userData.name}`)
      .setThumbnail(userThumbnail.data[0].imageUrl)
      .addFields(
        { name: "Create Date", value: userData.created, inline: true },
        { name: "Is Banned?", value: userData.isBanned ? "Yes" : "No", inline: true },
        { name: "Verified?", value: userData.hasVerifiedBadge ? "Yes" : "No", inline: true }
      )
      .setColor("Green")

    interaction.editReply({ embeds: [embed] })
  }
}