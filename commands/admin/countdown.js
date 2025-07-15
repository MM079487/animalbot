const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js")
const fs = require("fs")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("countdown")
    .setDescription("command about countdowns")
    .addSubcommand(subcommand =>
      subcommand.setName("check")
        .setDescription("check countdowns"),
    )
    .addSubcommand(subcommand =>
      subcommand.setName("add")
        .setDescription("add countdowns(admin only)")
        .addStringOption(option =>
          option.setName("name")
            .setDescription("example: ujian akhir tahun")
            .setRequired(true),
        )
        .addStringOption(option =>
          option.setName("date")
            .setDescription("example: June 20 2024")
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand.setName("delete")
        .setDescription("delete countdowns"),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand()
    await interaction.deferReply()

    let rawdata = fs.readFileSync('countdowns.json');
    let countdownsJson = JSON.parse(rawdata);

    const selectCountdowns = new StringSelectMenuBuilder()
      .setCustomId('select_countdowns')
      .setPlaceholder('Select Your Countdown')

    const selectToDeleteCountdowns = new StringSelectMenuBuilder()
      .setCustomId('select_to_delete_countdowns')
      .setPlaceholder('Select Your Countdown to Delete')

    if (subcommand == "check") {
      // send error if no countdowns recorded
      const noCountdownWarningEmbed = new EmbedBuilder()
      .setTitle("No Countdowns Recorded!")
      .setColor("Red")
  
      if(Object.keys(countdownsJson).length === 0) return await interaction.editReply({ embeds:[noCountdownWarningEmbed] })
      Object.entries(countdownsJson).forEach(([key, value]) => {
        selectCountdowns.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(key)
            .setValue(key.toLowerCase()),
        );
        return;
      });


      const countdownsRow = new ActionRowBuilder()
        .addComponents(selectCountdowns);

      const response = await interaction.editReply({ content: "Please Select:", components: [countdownsRow] })

      const countdownsCollectorFilter = i => i.user.id === interaction.user.id;

      try {
        const countdownsConfirmation = await response.awaitMessageComponent({ filter: countdownsCollectorFilter, time: 60 * 1000 });
        if (countdownsConfirmation.customId == "select_countdowns") {
          await countdownsConfirmation.update({ content: " ", embeds: [countDate(countdownsConfirmation.values[0], countdownsJson[countdownsConfirmation.values[0]].date)], components: [] })
        }
      } catch (e) {
        console.log(e)
      }

    } else if (subcommand == "add") {
      if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        const nameInput = interaction.options.getString("name").toLowerCase()
        const dateInput = interaction.options.getString("date")
        if (countdownsJson[nameInput]) {
          await interaction.editReply("This name already existed!")
          return true
        }

        if (countDate(nameInput, dateInput) == false) {
          await interaction.editReply("Date already passed or format error")
          return true
        }

        countdownsJson[nameInput] = {
          "date": dateInput
        }

        fs.writeFile("countdowns.json", JSON.stringify(countdownsJson), (err) => {
          if (err) console.log(err)
        })

           const addEmbed = new EmbedBuilder()
            .setTitle("Countdown Added!")
            .setColor("Green")
            .setDescription(`\`${nameInput}\` has been added`)
        
        await interaction.editReply({ embeds: [addEmbed] })
      } else {
        await interaction.editReply("Get out the way you are not admin!!")
      }
    } else if (subcommand == "delete") {
      // send error if no countdowns recorded
      const noCountdownWarningEmbed = new EmbedBuilder()
      .setTitle("No Countdowns Recorded!")
      .setColor("Red")
  
      if(Object.keys(countdownsJson).length === 0) return await interaction.editReply({ embeds:[noCountdownWarningEmbed] })

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.editReply("Get out you are not admin!!")
      console.log(countdownsJson)
      Object.entries(countdownsJson).forEach(([key, value]) => {
        selectToDeleteCountdowns.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(key)
            .setValue(key.toLowerCase()),
        );
      });

      const deleteCountdownsRow = new ActionRowBuilder()
        .addComponents(selectToDeleteCountdowns);

      const response = await interaction.editReply({ content: "Please Select What to Delete:", components: [deleteCountdownsRow] })

      const countdownsCollectorFilter = i => i.user.id === interaction.user.id;

      try {
        const countdownsConfirmation = await response.awaitMessageComponent({ filter: countdownsCollectorFilter, time: 60 * 1000 });
        if (countdownsConfirmation.customId == "select_to_delete_countdowns") {
          delete countdownsJson[countdownsConfirmation.values[0]]
          fs.writeFile("countdowns.json", JSON.stringify(countdownsJson), (err) => {
            if (err) console.log(err)
          })

          const deleteEmbed = new EmbedBuilder()
            .setTitle("Countdown Deleted!")
            .setColor("Green")
            .setDescription(`\`${countdownsConfirmation.values[0]}\` has been deleted`)
          
          await countdownsConfirmation.update({ content: " ", embeds: [deleteEmbed], components: [] })
        }
      } catch (e) {
        console.log(e)
      }

    }


    function countDate(name, date) {
      const countdownDate = new Date(date)
      
      const dateNow = new Date(new Date().getTime())
      const diffTime = Math.abs(dateNow - countdownDate);

      if (countdownDate.getTime() < dateNow.getTime()) return false //passed time

      if (Number.isNaN(diffTime)) return false


      const embed = new EmbedBuilder()
        .setTitle(`${name.toUpperCase()} Countdown`)
        .setDescription(`\`${dhm(diffTime)} left \`\nhttps://ahttps://animalbot-ddkm.onrender.com/countdown`)
        .setColor("Random")

      return embed
    }
    function dhm(t) {
      var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor((t - d * cd) / ch),
        m = Math.round((t - d * cd - h * ch) / 60000),
        pad = function(n) { return n < 10 ? '0' + n : n; };
      if (m === 60) {
        h++;
        m = 0;
      }
      if (h === 24) {
        d++;
        h = 0;
      }
      return `${d} days ${pad(h)} hours and ${pad(m)} minutes`;
    }
  }
}
