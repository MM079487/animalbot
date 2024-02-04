const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const { fetchUserData } = require("../../functions/fetchUserData")
const userData = require("../../schemas/userData")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("claim your daily reward!"),
  async execute(interaction, client){
    try{
      await interaction.deferReply();

      const data = await fetchUserData(interaction.user.id)
      
      if(data.lastDaily){
        const lastDailyDate = data.lastDaily.toDateString()
        const currentDate = new Date().toDateString()

        if(lastDailyDate == currentDate){
          interaction.editReply({
            content:"Bro u already claimed your reward",
            ephemeral: true
          })
          return;
        }
      }else{
        data.lastDaily = new Date().toDateString();
      }

      data.wallet += 1000;
      await data.save()

      const embed = new EmbedBuilder()
      .setAuthor({ name:interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("Claimed daily reward")
      .setDescription(`Wallet: $${data.wallet-1000} + $1000`)
      .setColor("Green")
      
      interaction.editReply({ content: "", embeds:[embed] })
    }catch(err){
      console.log(err)
    }
  }
}