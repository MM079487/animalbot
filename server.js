const express = require("express")
const app = express()

app.use(express.static(__dirname + '/website'));

function keepAlive(){
    app.listen(3000, ()=>{console.log("Server is Ready!")});
}
module.exports = keepAlive;