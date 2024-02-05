const tlg_token = process.env.tlg_token

module.exports = async (client, Discord) => {
    const fetch = require("node-fetch")
    client.on("messageCreate", async message => {
      if(message.channel.id != "1203744518315184148") return true
      if(message.author.bot) return true
        // https://api.telegram.org/bot${TOKEN}
        // -4172380255
        let txt = `__${message.author.username || "undefined" }__\n${message.content || " " }`
        console.log(txt)
        await fetch(`https://api.telegram.org/bot${tlg_token}/sendMessage?chat-id=${-4172380255}&text=${txt}`, {
          method:"POST",
        })
    })
}
