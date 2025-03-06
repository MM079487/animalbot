const fs = require("fs")

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
        }
        messageData[today] += 1;
    
        // Save to file
        fs.writeFileSync(dataFile, JSON.stringify(messageData, null, 4));

    }
  }