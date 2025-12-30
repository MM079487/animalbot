const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday_search")
    .setDescription("search how many people got the same birthday with you")
    .addIntegerOption(option =>
        option.setName("year")
            .setDescription("Year of birth")
            .setMinValue(1920)
            .setMaxValue(2023)
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("month")
            .setDescription("Month of birth")
            .setMinValue(1)
            .setMaxValue(12)
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("day")
            .setDescription("Day of birth")
            .setMinValue(1)
            .setMaxValue(31)
            .setRequired(true)
    ),

  async execute(interaction, client){
    const fetch = require("node-fetch")
    const year = interaction.options.getInteger("year")
    const month = interaction.options.getInteger("month")
    const day = interaction.options.getInteger("day")

    const url = `https://api.data.gov.my/data-catalogue/?id=births&icontains=${year}-${pad(month, 2)}-${day}@date&limit=1`
    
    await interaction.deferReply()
    
    fetch(url)
      .then((response) => response.json())
      .then((a) => {
        try {
            const data = a[0]
            console.log(data)
            const embed = new EmbedBuilder()
            .setTitle(`${data.date}`)
            .setDescription(`有 ***${data.births}*** 人在这天生日！`)
            .setFooter({ text:"using Malaysia's official open data portal API" })
            .setColor("Green")

            interaction.editReply({ embeds:[embed] })
        } catch (err) {
            const errEmbed = new EmbedBuilder()
            .setTitle("Error (not my fault)")
            .setDescription(`\`${err}\``)
            .setColor("Red")

            interaction.editReply({ embeds:[errEmbed] })
        }
      })


      function pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
  }
}