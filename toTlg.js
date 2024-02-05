require("dotenv").config()
const tlg_token = process.env.tlg_token

module.exports = async (client, Discord) => {
    const fetch = require("node-fetch")
    const chatID = -4172380255
    client.on("messageCreate", async message => {
      const attachments = message.attachments;
      // const url = attachment ? attachment.url : null;
      if(message.channel.id != 1203744518315184148) return true
      if(message.author.bot) return true
        // https://api.telegram.org/bot${TOKEN}
        // -4172380255
        let txt = `<u>${message.author.username || "undefined" }</u>\n${message.content || " " }`
        if(attachments.first()){
          console.log("ATTACHMENT FOUND")
          attachments.forEach(async att => {
            console.log(att.url)
            txt = `<u>${message.author.username || "undefined" }</u>\n${message.content || " " }\n<a href="${att.url}">.</a>`
            let data = {
              chat_id: chatID,
              text: txt,
              parse_mode:"html"
            }
            console.log(data)
            await fetch(`https://api.telegram.org/bot${tlg_token}/sendMessage`, {
              method:"POST",
              headers: {"content-type": "application/json"},
              body: JSON.stringify(data)
            })
            txt = ""
            txt = `<u>${message.author.username || "undefined" }</u>\n${message.content || " " }`
            console.log("ATTACHMENT SENT")
          });
          return
        }
        let data = {
          chat_id: chatID,
          text: txt,
          parse_mode:"html"
        }
        await fetch(`https://api.telegram.org/bot${tlg_token}/sendMessage`, {
          method:"POST",
          headers: {"content-type": "application/json"},
          body: JSON.stringify(data)
        })

      })
    }
