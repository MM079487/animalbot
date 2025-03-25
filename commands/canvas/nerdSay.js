const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js")
const { createCanvas, loadImage } = require("canvas")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("nerd-say")
  .setDescription("Generate an image of nerd saying something")
    .addStringOption(option =>
		option.setName('message')
			.setDescription('What will nerd say')
            .setRequired(true)
    ),
  async execute(interaction, client) {
    const messageInput = interaction.options.getString("message")

    await interaction.deferReply()

    ///880 480
    const canvas = createCanvas(680, 674);
    const ctx = canvas.getContext('2d')

    
    const image = await loadImage("https://i.kym-cdn.com/photos/images/newsfeed/002/341/982/913.png");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.font = "30px"
        ctx.fillText(messageInput, canvas.width/2, 90)

        const buffer = canvas.toBuffer("image/png")
        const attachment = new AttachmentBuilder(buffer, { name: 'image.png' });
    
        await interaction.editReply({ files: [attachment] })

  }
}