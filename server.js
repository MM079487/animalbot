const express = require("express")
const mongoose = require("mongoose")
const fs = require("fs")
require('dotenv').config()

const app = express()
let logText = `
<u style="font-size:60px;">BOT LOG</u>
<div style="font-size:30px">
<br>${new Date().toLocaleString()} - Bot start
`

app.use(express.static(__dirname + '/public/index'));

app.use("/countdown", express.static(__dirname + '/public/countdown'))

app.use("/chart", express.static(__dirname + '/public/msgTrack'))

app.get("/logs", function (req, res) {
    res.send(logText)
});

function postTime(msg) {
    logText += `<br>${new Date().toLocaleString()} - ${msg}`
}

const jsonSchema = new mongoose.Schema({ data: Object, timestamp: String });
const JsonModel = mongoose.models.JsonData || mongoose.model("logs", jsonSchema);

async function getJsonFromMongo() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const data = await JsonModel.findOne().sort({ _id: -1 }); // Get the most recent entry
        mongoose.connection.close(); // Close DB connection
        fs.writeFileSync("public/msgTrack/dailyMessageCount.json", JSON.stringify(data.data));
        return true // Return stored JSON
    } catch (error) {
        console.error("Error retrieving JSON from MongoDB:", error);
        return null;
    }
}

//setup local json file, so messageActivityTrack.js can read and write new data
getJsonFromMongo()

async function updateJsonData(json) {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const newEntry = new JsonModel({ data: json, timestamp: new Date() });
        await newEntry.save(); // Insert new data
    } catch (error) {
        console.error("❌ Error replacing database:", error);
    }
}

//update local json file to server every 5s
setInterval(() => {
    updateJsonData(JSON.parse(fs.readFileSync("public/msgTrack/dailyMessageCount.json", "utf8")))
}, 5000);

app.get("/chartData", function(req, res) {
    require("./events/message/messageActivityTrack");

    if(global.firstAndLastMessageData == undefined){
        res.sendStatus(204)
    }else{
        res.send(global.firstAndLastMessageData)
    }
});

function keepAlive() {
    app.listen(3000, () => { console.log("Server is Ready!") });
}

module.exports = {
    keepAlive: keepAlive,
    postTime: postTime
}