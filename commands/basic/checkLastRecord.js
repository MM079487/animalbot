const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check_last_record")
    .setDescription("check last recorded message"),
  async execute(interaction, client) {
    await interaction.deferReply()

    const fetch = require("node-fetch")

    fetch('https://animal-bot-5hs7.onrender.com/data.json')
      .then((response) => response.json())
      .then(async data => {
        try {
          let guildMessage = [];

          for(var x in data){
            if(data[x].guildName == interaction.guild.name) guildMessage.push(data[x])
          }
          const lastRecord = guildMessage[Object.keys(guildMessage)[Object.keys(guildMessage).length - 1]]
          if(!lastRecord) return interaction.editReply("ERROR")
          if(lastRecord.message == "" && lastRecord.attachment){
            const embed = new EmbedBuilder()
            .setAuthor({ name: lastRecord.name, iconURL: lastRecord.authorIcon })
            .setDescription(`\`\`\`Attachment\`\`\`\n<t:${Math.floor(lastRecord.time / 1000)}:R> | <t:${Math.floor(lastRecord.time / 1000)}:f> - ${lastRecord.channel} (${lastRecord.guildName})\nhttps://e777eb1a-bd03-4bd2-9c5a-280c1f703ed6-00-95hbmw2y6pp8.global.replit.dev`)
            .setColor(0x2B2D31)

          interaction.editReply({ embeds: [embed] })
            return;
          }
          
          const modifiedMsg = lastRecord.message.replace(/<br>/g, "")
                                                         
          //                                                (match, p1, p2, p3) => {
          //   if (p3) {
          //     return `\n${p3}`;
          //   }
          //   return "";
          // })

          const embed = new EmbedBuilder()
            .setAuthor({ name: lastRecord.name, iconURL: lastRecord.authorIcon })
            .setDescription(`\`\`\`${modifiedMsg}\`\`\`\n<t:${Math.floor(lastRecord.time / 1000)}:R> | <t:${Math.floor(lastRecord.time / 1000)}:f> - ${lastRecord.channel} (${lastRecord.guildName})\nhttps://animal-bot-5hs7.onrender.com`)
          .setColor(0x2B2D31)

          interaction.editReply({ embeds: [embed] })
        } catch (err) {
          console.log(err)
        }
      })


    // const embed = new EmbedBuilder()
    // .setAuthor({ name: "...", iconURL: "" })
  }
}
