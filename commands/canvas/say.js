const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js")
const { createCanvas, loadImage, registerFont } = require("canvas")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("say")
  .setDescription("Generate an image of someone saying something")
	.addUserOption(option =>
		option.setName('user')
			.setDescription('Who will say that')
            .setRequired(true)
    )
    .addStringOption(option =>
		option.setName('message')
			.setDescription('What will him/her say')
            .setRequired(true)
    ),
  async execute(interaction, client) {
    const userInput = interaction.options.getUser("user")
    const messageInput = interaction.options.getString("message")
    const avatarURL = userInput.displayAvatarURL({ extension: 'png', size: 128 });

    registerFont("fonts/NotoSansSC-Bold.ttf", { family: "NotoSansSC"})

    const canvas = createCanvas(880, 480);
    const ctx = canvas.getContext('2d')

    
    const image = await loadImage("https://i.imgflip.com/4zkxhp.png?a484032");
    const avatar = await loadImage(avatarURL)
    const imgSize = 200; // Avatar size
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Calculate top-left position so the image is centered
        const imgX = centerX - imgSize / 2;
        const imgY = centerY - imgSize / 2;

        ctx.drawImage(avatar, imgX+180, imgY, imgSize, imgSize)
        
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.font = '30px "NotoSansSC"'
        ctx.fillText(messageInput, 260, 250)
        //width 375

        const buffer = canvas.toBuffer("image/png")
        const attachment = new AttachmentBuilder(buffer, { name: 'image.png' });
    
        await interaction.reply({ files: [attachment] })

  }
}