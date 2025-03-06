const express = require("express")
const app = express()
let logText = `
<u style="font-size:60px;">BOT LOG</u>
<div style="font-size:30px">
<br>${new Date().toLocaleString()} - Bot start
`

app.use(express.static(__dirname + '/public/index'));

app.use("/countdown", express.static(__dirname + '/public/countdown'))

app.use("/chart", express.static(__dirname + '/public/msgTrack'))

app.get("/logs", function(req, res) {
    res.send(logText)
});

function postTime(msg){
    logText += `<br>${new Date().toLocaleString()} - ${msg}`
}


function keepAlive(){
    app.listen(3000, ()=>{console.log("Server is Ready!")});
}


module.exports = {
 keepAlive: keepAlive,
 postTime: postTime  
}