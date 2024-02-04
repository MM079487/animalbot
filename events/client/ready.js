const { loadCommands } = require("../../handlers/commandHandler");
const { autoCountdown } = require("../../handlers/autoCountdown");
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

    loadCommands(client);
    autoCountdown(client);
  }
}