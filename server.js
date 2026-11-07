const express = require("express")
require('dotenv').config()
const dailyCounts = require("./dailyCounts")

const app = express()
let logText = `
<u style="font-size:60px;">BOT LOG</u>
<div style="font-size:30px">
<br>${new Date().toLocaleString()} - Bot start
`

// Live data straight from MongoDB (registered BEFORE the static folders, so the stale
// file on disk can never be served). Existing front-end code fetches this same URL.
app.get("/chart/dailyMessageCount.json", async function (req, res) {
    try {
        res.set("Cache-Control", "no-store")
        res.json(await dailyCounts.getCounts())
    } catch (err) {
        console.error("Error reading daily counts:", err)
        res.sendStatus(503)
    }
});

app.get("/chartData", async function (req, res) {
    try {
        res.set("Cache-Control", "no-store")
        const data = await dailyCounts.getFirstLast()
        if (!data) return res.sendStatus(204)
        res.json(data)
    } catch (err) {
        console.error("Error reading first/last message:", err)
        res.sendStatus(503)
    }
});

app.use(express.static(__dirname + '/public/index'));

app.use("/countdown", express.static(__dirname + '/public/countdown'))

app.use("/chart", express.static(__dirname + '/public/msgTrack'))

app.get("/logs", function (req, res) {
    res.send(logText)
});

function postTime(msg) {
    logText += `<br>${new Date().toLocaleString()} - ${msg}`
}

// connect to MongoDB once, then start flushing counted messages to it
dailyCounts.init()

function keepAlive() {
    app.listen(3000, () => { console.log("Server is Ready!") });
}

module.exports = {
    keepAlive: keepAlive,
    postTime: postTime
}
