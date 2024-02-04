const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName("spam_vc")
  .setDescription("wanna annoy someone?")
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
            .addIntegerOption(option =>
            option.setName("second")
                .setDescription("the duration in second")
                .setMinValue(1)
                .setRequired(true)
                ),
  execute(interaction, client){
    let connection;
    const secondInput = interaction.options.getInteger("second")
    
    if (!interaction.member.voice.channel) {
      const warnEmbed = new EmbedBuilder()
        .setTitle("Join a voice channel first you stupid!")
        .setColor("Red")

      interaction.reply({ embeds: [warnEmbed], ephemeral: true })
      return true
    }



    let i = 20;
    let DELAY = 300 //in ms

      
      const second = parseInt(secondInput) * 1000
      i = parseInt(second / DELAY)
    
    function join() {

      i--;
      connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      })

      if (i > 0) {
        setTimeout(leave, DELAY);
      }else{
        if(client.voice.adapters.size > 0) return connection.destroy()
      }
    };

    function leave() {
      i--
      if (client.voice.adapters.size <= 0) {
        setTimeout(join, DELAY);
        return true
      }
      connection.destroy()
      if (i > 0) {
        setTimeout(join, DELAY);
      } else {
        if(client.voice.adapters.size > 0) return connection.destroy()
      }
    }

    setTimeout(join, DELAY);
    interaction.reply("bruh ok")


  }
}