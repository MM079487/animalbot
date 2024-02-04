const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } = require("discord.js")
let voteInProgress = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("votekick")
    .setDescription("vote kick someone")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addMentionableOption(option => 
      option.setName("user")
            .setDescription("The user that you want to vote kick")
            .setRequired(true)
      )
    .addIntegerOption(option => 
      option.setName("max_vote")
            .setDescription("When vote amount is more than this, user will be kick")
            .setMinValue(3)
            .setMaxValue(50)
            .setRequired(true)          
      )
    .addIntegerOption(option => 
      option.setName("vote_time")
            .setDescription("When time (in minute) is more end and vote amount is enough, user will be kick")
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true)
      ),
  execute(interaction, client) {
    const voteInProgressEmbed = new EmbedBuilder()
      .setTitle("Another vote is in progress! Please wait for the vote end")
      .setColor(0xFF0000)

    let mentionedUser = null
    const channel = client.channels.cache.get("1045516560627925063")

    if(interaction.guildId != "974494856099549204") return interaction.reply({ content: "This command can only use in specific server", ephemeral: true })

    let maxNum = interaction.options.getInteger("max_vote")
    let timeNum = interaction.options.getInteger("vote_time")
    const mentionInput = interaction.options.getMentionable("user")

    if (voteInProgress) return interaction.reply({ embeds: [voteInProgressEmbed], ephemeral: true })

    mentionedUser = mentionInput

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('end')
          .setLabel('End (admin only)')
          .setStyle(ButtonStyle.Danger)
      );


    let votedUsers = []
    let voted = 0
    const embed = new EmbedBuilder()
      .setTitle(`Kick ${mentionedUser.user.username} ?`)
      .setAuthor({ name: `${mentionedUser.user.username}#${mentionedUser.user.discriminator}`, iconURL: mentionedUser.user.displayAvatarURL() })
      .setColor(0xFFFF00)
      .setDescription(`Voted: ${voted}/${maxNum}\nThis vote will end in ${timeNum} minute start from now!`)
      .setFooter({ text: `vote created by - ${interaction.user.username}#${interaction.user.discriminator}` })

    channel.send({ embeds: [embed], components: [buttons] }).then(msg => {
      voteInProgress = true
      

      //button pressed

      const filter = i => i.customId === 'yes' && i.user.id != votedUsers.find(id => i.user.id == id)

      const collector = channel.createMessageComponentCollector({ filter, max: maxNum, time: timeNum * 1000 * 60, errors: ['time'] })

      collector.on('collect', i => {
        voted += 1
        if (voted == maxNum) return true;
        embed.setDescription(`Voted: ${voted}/${maxNum}\nThis vote will end in ${timeNum} minute start from now!`)
        i.update({ embeds: [embed] })
        votedUsers.push(i.user.id)
      });


      //end button
      client.on(Events.InteractionCreate, i => {
        if (!i.isButton()) return;
        if (i.customId == "end") {
          if (!i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply({ content: "You are not admin", ephemeral: true });
          collector.stop()
          embed.setDescription(`***Admin Ended This Vote***`)
          embed.setColor(0xFF0000)
          return msg.edit({ embeds: [embed], components: [] })
        }
      });


      collector.on('end', collected => {
        if (collected.size < maxNum) { //time is up and not enough vote
          voted = collected.size
          embed.setDescription(`Voted: ${voted}/${maxNum}\n***Time is up! No vote enough to kick this user!***`)
          embed.setColor(0xFF0000)
          msg.edit({ embeds: [embed], components: [] })
        } else {
          voted = collected.size
          if (mentionInput.bannable) {
            mentionInput.kick({ reason: "You have just kicked by Vote Kick" })
            embed.setDescription(`Voted: ${voted}/${maxNum}\n***Vote ended, user has been kicked***`)
            embed.setColor(0x00FF00)
            msg.edit({ embeds: [embed], components: [] })
          } else {
            embed.setDescription(`Voted: ${voted}/${maxNum}\n***Vote ended, no enough permission to kick this user!***`)
            embed.setColor(0xCC5500)
            msg.edit({ embeds: [embed], components: [] })
          }
        }
      
        voteInProgress = false
      })
    })
        const sentEmbed = new EmbedBuilder()
    .setTitle("Vote Started")
    .setDescription(`<#${channel.id}>`)
    .setColor("Green")
    interaction.reply({ embeds:[sentEmbed], ephemeral:false })
  }
}