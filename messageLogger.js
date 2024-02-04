module.exports = (client, Discord) => {
  const { refreshWeb } = require("./index.js")
  const fs = require("fs")
  const { EmbedBuilder } = require("discord.js")
  let embedJson;
  const whiteList = [967078537804779520];
  const whiteListChannel = [1109473544317968384]

  client.on("messageDelete", message => {
    if(message.author.bot) return true
    if(message.guild.id == "797265684618543141") return console.log(message.content)
    if(whiteList.includes(Number(message.author.id))) return console.log(message.content)
    if(whiteListChannel.includes(Number(message.channel.id))) return console.log(message.content)

    if (message.attachments.size < 1) { //message only
      const embed = new EmbedBuilder()
        .setTitle("Deleted: ")
        .setDescription(message.content)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(0xff0000)

      embedJson = {
        name: message.author.username,
        authorIcon: message.author.displayAvatarURL(),
        message: message.content,
        time: message.createdTimestamp,
        channel : message.channel.name,
        guildName: message.guild.name,
        guildIcon: message.guild.iconURL()
      }

      saveData(embedJson)

    } else { //have attachments

      const attachmentEmbed = new EmbedBuilder()
        .setTitle("Deleted: ")
        .setDescription(message.content || " ")
        .setImage(message.attachments.first().url)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(0xff0000)

      let attachmentArray = [];
      
      message.attachments.forEach((value, key) => {
        attachmentArray.push(value.url)
      })
      
      embedJson = {
        name: message.author.username,
        authorIcon: message.author.displayAvatarURL(),
        message: message.content,
        time: message.createdTimestamp,
        attachment: attachmentArray,
        channel : message.channel.name,
        guildName: message.guild.name,
        guildIcon: message.guild.iconURL()
        
      }
      saveData(embedJson)
    }

  })


  client.on("messageUpdate", (oldMessage, newMessage) => {
    if(oldMessage.author.bot) return false;
    if(oldMessage.guild.id == "797265684618543141") return console.log(oldMessage.content)
    if(whiteList.includes(Number(oldMessage.author.id))) return console.log(oldMessage.content)
    if(whiteListChannel.includes(Number(oldMessage.channel.id))) return console.log(oldMessage.content)
    
    const editedEmbed = new EmbedBuilder()
      .setTitle("Edited:")
      .addFields(
        { name: "Before:", value: oldMessage.content },
        { name: "After:", value: newMessage.content },
      )
      .setColor(0xf2ff00)
      .setAuthor({ name: newMessage.author.username, iconURL: newMessage.author.displayAvatarURL() })

    if(oldMessage.content == newMessage.content) return false
    
    embedJson = {
      name: newMessage.author.username,
      authorIcon: newMessage.author.displayAvatarURL(),
      message: `
        Edited:
        <br>
        <br>
        Before: ${oldMessage.content}
        <br>
        After: ${newMessage.content}
        `,
      time: newMessage.createdTimestamp,
      channel : newMessage.channel.name,
      guildName: newMessage.guild.name,
      guildIcon: newMessage.guild.iconURL()
    }

    saveData(embedJson)
  })

  function saveData(data) {//from embedJson
    refreshWeb(data)
  }
}