const tlg_token = process.env.tlg_token

module.exports = async (client, Discord) => {
    const fetch = require("node-fetch")
    client.on("messageCreate", async message => {
        // https://api.telegram.org/bot${TOKEN}
        // -4172380255
        let txt = `__${message.author.username || "undefined" }__\n${message.content || " " }`
        await fetch(`https://api.telegram.org/bot${tlg_token}/sendMessage`, {
          method:"POST",
          data:{
            chat_id: -4172380255,
            text: txt
          }  
        })
    })
}
