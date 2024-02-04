const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("count_bmi")
    .setDescription("calculate your BMI")
    .addIntegerOption(option => 
      option.setName("weight")
            .setDescription("your weight in KG")
            .setMinValue(1)
            .setRequired(true)
      )
      .addIntegerOption(option => 
      option.setName("height")
            .setDescription("your height in cm")
            .setMinValue(1)
            .setRequired(true)
      ),
  async execute(interaction, client){
    const weightInput = interaction.options.getInteger("weight")
    const heightInput = interaction.options.getInteger("height")
    let message;
    let bmiClass;

    await interaction.deferReply()

    const bmiValue = Math.round((weightInput / (heightInput/100)**2) * 10) / 10

    if(bmiValue < 10 || bmiValue > 100){
      message = "Bro ur alien"
      bmiClass = "?????????????"
    }else if(bmiValue < 18.5){
      message = "Bro you need some MILK"
      bmiClass = "Under Weight"
    }else if(bmiValue >= 18.5 && bmiValue <= 24.9){
      message = "uhm... good"
      bmiClass = "Normal"
    }else if(bmiValue >= 25 && bmiValue <= 29.9){
      message = "hahahahaha u fat"
      bmiClass = "Over Weight"
    }else if(bmiValue >= 30 && bmiValue <= 34.9){
      message = "bro is discord mod"
      bmiClass = "Obesity class I"
    }else if(bmiValue >= 35 && bmiValue <= 39.9){
      message = "Bro wearing XXXXXXXXXXXXL shirt"
      bmiClass = "Obesity class II"
    }else if(bmiValue > 40){
      message = "Is that a truck?"
      bmiClass = "Extreme Obesity"
    }

    const embed = new EmbedBuilder()
    .setAuthor({ name:interaction.user.username, iconURL:interaction.user.displayAvatarURL() })
    .setTitle(`Weight: ${weightInput}kg | Height: ${heightInput}cm`)
    .setDescription(`***BMI: ${bmiValue} (${bmiClass})***\n*${message}*`)
    .setColor("Green")
.setImage("https://cdn.discordapp.com/attachments/891554723256213526/1088673522139807774/file-20200724-25-osy3a3.png")
    
    interaction.editReply({ embeds:[embed] })
  }
}