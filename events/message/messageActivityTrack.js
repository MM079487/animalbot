const fs = require("fs")
let firstAndLastMessageData = {};
let mostRecentMessageData = {};


function fireExport(){
    exports.test = "test"
}

module.exports = {
    name:"messageCreate",
    async execute(message, client){
        const dataFile = "public/msgTrack/dailyMessageCount.json";

        // Load existing data or create a new file
        let messageData = {};
        if (fs.existsSync(dataFile)) {
            messageData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
        }

        if (message.author.bot) return;

        let today = new Date().toLocaleDateString();

        messageData = Object.fromEntries(Object.entries(messageData).slice(-14));
    
        // Increment message count for today
        if (!messageData[today]) {
            messageData[today] = 0;

            //record first & last message of the day too!
            //[0] means 1st msg and [1] means last msg

            firstAndLastMessageData[0] = {
                "author": message.author.username,
                "iconURL":  message.author.displayAvatarURL(),
                "content": message.content
            }

            firstAndLastMessageData[1] = mostRecentMessageData
            global.firstAndLastMessageData = firstAndLastMessageData
        }

        mostRecentMessageData = {
            "author": message.author.username,
            "iconURL":  message.author.displayAvatarURL(),
            "content": message.content
        }
        messageData[today] += 1;
    
        // Save to file
        fs.writeFileSync(dataFile, JSON.stringify(messageData, null, 4));

        //record first & last message of the day

    },

  }