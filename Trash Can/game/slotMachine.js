const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const { fetchUserData } = require("../../functions/fetchUserData")
const userData = require("../../schemas/userData")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("slotmachine")  
  .setDescription("yea slot machine")
  .addIntegerOption(option =>
      option.setName("money")
            .setDescription("how much money you want to bet")
            .setMinValue(1)
            .setRequired(true)
   ),
  async execute(interaction, client){
    const moneyInput = interaction.options.getInteger("money")
    await interaction.deferReply();

    const num1 = Math.floor(Math.random() * (9 - 1 + 1) + 1)
    const num2 = Math.floor(Math.random() * (9 - 1 + 1) + 1)
    const num3 = Math.floor(Math.random() * (9 - 1 + 1) + 1)

    const data = await fetchUserData(interaction.user.id)

    if(num1 == num2 || num2 == num3 || num1 == num3){
      const twoSameEmbed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("Congratulation!!!")
      .setDescription(`***[${num1}] [${num2}] [${num3}]***\n\nadded $${moneyInput * 10 - moneyInput} to your wallet`)
      .setColor("Green")

      data.wallet += (moneyInput * 10) - moneyInput
      data.save()
      interaction.editReply({ embeds:[twoSameEmbed] })
    }else if(num1 == num2 && num2 == num3 && num1 == num3){
      const allSameEmbed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("Bro u must be cheating")
      .setDescription(`***[${num1}] [${num2}] [${num3}]***\n\nadded $${moneyInput * 50 - moneyInput} to your wallet!!`)
      .setColor("Green")

      data.wallet += (moneyInput * 50) - moneyInput
      data.save()
      interaction.editReply({ embeds:[allSameEmbed] })
    }else{
      const noSameEmbed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("Noob haha")
      .setDescription(`***[${num1}] [${num2}] [${num3}]***\n\nbro u lost $${moneyInput}`)
      .setColor("Yellow")

      data.wallet -= moneyInput
      data.save()
      interaction.editReply({ embeds:[noSameEmbed] })
    }
  }
}