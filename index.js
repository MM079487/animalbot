const express = require("express")
const app = express()
const prefix = "-"
const fs = require("fs")
const path = require("path")
const logger = require("./messageLogger.js")
const toTlg = require("./toTlg.js")
const { keepAlive, postTime } = require("./server.js")
const fetch = require("node-fetch")
require('dotenv').config()

keepAlive();

const Discord = require("discord.js")
const { GatewayIntentBits, Collection, ActivityType, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
})

const { loadEvents } = require("./handlers/eventHandler")

client.events = new Collection();
client.commands = new Collection();


loadEvents(client);;

client.on("ready", () => {

  client.user.setPresence({
    activities: [{ name: `你妈`, type: ActivityType.Playing }], status: "online"
  });

  logger(client, Discord)
  // toTlg(client, Discord)
})

// async function getPinyin(text) {
//   const response = await fetch(`https://helloacm.com/api/pinyin/?cached&s=${text}`);
//   const result = await response.json();
//   return result.result
// }

client.cooldowns = new Discord.Collection();
client.COOLDOWN_SECONDS = 10; // replace with desired cooldown time in seconds

// client.on("interactionCreate", async interaction => {

//   if (interaction.user.bot) return;
//   if (message.inGuild() == false) return message.channel.send("U cant use commands here 💀");
//   if (!interaction.isChatInputCommand()) return;

//   let command = client.commands.get(interaction.commandName);
//   if (!command) interaction.reply({
//     content:"bruh, an error",
//     ephemeral: true
//   });


//     if (command.data.permission) {
//       if (member.permissions.has(PermissionsBitField.Flags[command.data.permission])) { //if user have permission then
//         command.run(client, interaction, Discord) //run command
//         return true
//       } else {
//         return interaction.reply({
//           content: "Bro dont have permission and still wanna use this command 💀",
//           ephemeral: true
//         });
//       }
//     }

//     command.run(client,interaction, Discord);
// })

client.login(process.env.token)

function refreshWeb(data) {
  let rawdata = fs.readFileSync('./public/index/data.json');
  let parsedRecordedData = JSON.parse(rawdata);

  parsedRecordedData[data.time] = data //added new message

  if (Object.keys(parsedRecordedData).length > 30) { //if length > 30 then delete first element
    let firstKey = Object.keys(parsedRecordedData)[0];
    delete parsedRecordedData[firstKey];
  }

  fs.writeFile("./public/index/data.json", JSON.stringify(parsedRecordedData), (err) => {
    if (err) console.log(error)
  })

  app.use(express.static(__dirname + '/public/index'));
}

function deleteLast() {
  let rawdata = fs.readFileSync('./public/index/data.json');
  let parsedRecordedData = JSON.parse(rawdata);

  let lastKey = Object.keys(parsedRecordedData)[Object.keys(parsedRecordedData).length - 1] //remove last
  delete parsedRecordedData[lastKey]

  fs.writeFile("./public/index/data.json", JSON.stringify(parsedRecordedData), (err) => {
    if (err) console.log(err)
  })

  app.use(express.static(__dirname + '/public/index'));
}

module.exports = { refreshWeb, deleteLast }
