const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const ttdl = require("tiktok-video-downloader");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tiktok_downloader")
    .setDescription("just give me the link")
    .addStringOption(option =>
      option.setName("link")
            .setDescription("the link of the tiktok video")
            .setRequired(true)
      ),
  async execute(interaction, client) {

    const link = interaction.options.getString("link")

    await interaction.deferReply()
    
    await ttdl.getInfo(link)
      .then(async (result) => {
        try{
        if(result.video.url.wm == "" || result.video.url.wm == undefined) return interaction.editReply({ embeds:[new EmbedBuilder().setTitle("Please make sure your link is complete and correct").setColor("Red")], ephemeral: true })
        const embed = new EmbedBuilder()
        .setTitle("TikTok")
        .setURL(result.video.url.no_wm)
        .setDescription(`❤️: ${result.video.loves}\n💬: ${result.video.comments}\n*click the title's hyperlink to download*`)
        .setFooter({ text: `${result.author.name}\n${result.author.username}`, iconURL: result.author.profile })
        .setColor("Green")
        
        await interaction.editReply({ embeds:[embed] })
        }catch(e){
          await interaction.editReply({ content:"Error....", ephemeral: true})
        }
      })
  }
}