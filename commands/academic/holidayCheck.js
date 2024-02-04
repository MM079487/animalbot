const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js")
const fetch = require("node-fetch")
const currentYear = new Date().getFullYear()

module.exports = {
  data: new SlashCommandBuilder()
    .setName("holiday_check")
    .setDescription("bro want holiday for real")
    .addSubcommand(command =>
      command
      .setName("full")
      .setDescription("Get full holidays list"),
    )
    .addSubcommand(command =>
      command
      .setName("month")
      .setDescription("Get holiday list for a month"),
    ),
  async execute(interaction, client) {

    await interaction.deferReply()

    const command = interaction.options.getSubcommand()

    let apiData;
    await fetch("https://php-holiday-api.mm079487.repl.co/")
      .then((response) => response.json())
      .then((data) => {
        apiData = data
      })

      if (command == "full") {
        let descText = "";
        apiData.data[0].collection[0].data.forEach(x => {
          if (x.is_holiday == false) return
          descText += `\n__**${x.name}**__\n\`${x.date} (${x.day})\n${x.description}\`\n`
        })

        const fullListEmbed = new EmbedBuilder()
          .setTitle("Full List of Malaysia Public Holidays")
          .setDescription(descText)
          .setColor("Green")

        interaction.editReply({ content: " ", embeds: [fullListEmbed], components: [] })
      } else if (command == "month") {

        const selectMonth = new StringSelectMenuBuilder()
          .setCustomId('select_month')
          .setPlaceholder('When?')

        let monthArray = [];
        await apiData.data[0].collection[0].data.forEach(x => {
          if (monthArray.includes(x.month)) return
          monthArray.push(x.month)
        })
        monthArray.forEach(x => {
          selectMonth.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(x)
              .setValue(x.toLowerCase()),
          );
        })

        const monthRow = new ActionRowBuilder()
          .addComponents(selectMonth);

       const response = await interaction.editReply({ content: "What month?", components: [monthRow] })

        const monthCollectorFilter = i => i.user.id === interaction.user.id;

        try {
          const monthConfirmation = await response.awaitMessageComponent({ filter: monthCollectorFilter, time: 60 * 1000 });
          if (monthConfirmation.customId == "select_month") {
            let desc = "";
            let currentMonth = "";
            if (monthArray.find(x => x.toLowerCase() == monthConfirmation.values[0])) { //if can find month in monthArray
              apiData.data[0].collection[0].data.forEach(x => {
                if (x.month.toLowerCase() != monthConfirmation.values[0]) return
                if (x.is_holiday == false) return
                desc += `\n__**${x.name}**__\n\`${x.date} (${x.day})\n${x.description}\`\n`
                currentMonth = x.month
              })

              const monthEmbed = new EmbedBuilder()
                .setTitle(`${currentMonth} Public Holidays`)
                .setDescription(desc)
                .setColor("Green")

              monthConfirmation.update({ content: " ", embeds: [monthEmbed], components: [] })
            } else {
              await interaction.editReply({ content: "No Holiday In That Month, cry about it haha", components: [] })
            }
          }
        } catch (e) {
          console.log(e)
          await interaction.editReply({ components: [] });
        }
      } else {
        console.log(confirmation.values[0])
      }
  }
}