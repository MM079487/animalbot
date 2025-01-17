const { loadCommands } = require("../../handlers/commandHandler");
const { autoCountdown } = require("../../handlers/autoCountdown");
const cron = require("node-cron")
// const mongoose = require("mongoose")
// const mongoDBURL = process.env['MongoDBURL']

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready")

    // if(!mongoDBURL) return;

    // await mongoose.connect(mongoDBURL || "", {
    //   keepAlive: true,
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true
    // })

    // if (mongoose.connect) {
    //   console.log("Database ready")
    // }
    function test(msg){
      console.log(new Date().getMinutes())
      console.log(msg)
    }

    loadCommands(client);
    // run autoCountdown everyday at 0:00
    cron.schedule("0 0 * * *", function(){
      autoCountdown(client)
    });
  }
}