const express = require("express")
const app = express()
let logText = null;

app.use(express.static(__dirname + '/website'));


function postTime(msg){
    logText += `<br>${msg} - ${new Date().toLocaleString()}`;
}

app.get("/logs", function(req, res) {
    if (logText !== null) {
        res.send(logText); // Send the stored time value
    } else {
        //first line setup
        logText = `
        <u style="font-size:60px;">BOT LOG</u>
        <div style="font-size:30px">
        <br>Bot start - ${new Date().toLocaleString()}
        `
        res.send(logText)
    }
});

function keepAlive(){
    app.listen(3000, ()=>{console.log("Server is Ready!")});
}


module.exports = {
 keepAlive: keepAlive,
 postTime: postTime  
}