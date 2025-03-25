const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js")
const { createCanvas, loadImage } = require("canvas")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("clown-say")
  .setDescription("Generate an image of clown saying something")
    .addStringOption(option =>
		option.setName('message')
			.setDescription('What will clown say')
            .setRequired(true)
    ),
  async execute(interaction, client) {
    const messageInput = interaction.options.getString("message")

    await interaction.deferReply()

    const canvas = createCanvas(1667, 794);
    const ctx = canvas.getContext('2d')

    
    const image = await loadImage("https://i.imgflip.com/8c3v61.png");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.font = '50px "Arial", "Microsoft YaHei", "Noto Sans SC", sans-serif'
        ctx.fillText(`\" ${messageInput} \"`, 500, canvas.height/2)

        const buffer = canvas.toBuffer("image/png")
        const attachment = new AttachmentBuilder(buffer, { name: 'image.png' });
    
        await interaction.editReply({ files: [attachment] })

  }
}