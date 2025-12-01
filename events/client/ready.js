const { loadCommands } = require("../../handlers/commandHandler");
const { autoCountdown } = require("../../handlers/autoCountdown");
const { autoShow4DResult } = require("../../handlers/autoShow4DResult");
const { postTime } = require("../../server.js")
const cron = require("node-cron")
// const mongoose = require("mongoose")
// const mongoDBURL = process.env['MongoDBURL']

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {

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
    // run autoCountdown everyday at 0:00

    cron.schedule("0 0 * * *", async function () {
      try {
        postTime("cronjob triggered");
        autoCountdown(client)
      } catch (error) {
        console.error("Cron job error:", error);
      }
    });

    cron.schedule("1 19 * * 6", async function () { //Saturday Toto
      try {
        postTime("4D cronjob triggered");
        autoShow4DResult(client);
      } catch (error) {
        console.error("4D Cron job error:", error);
      }
    })

    cron.schedule("1 19 * * 7", async function () { //Sunday 4D
      try {
        postTime("4D cronjob triggered");
        autoShow4DResult(client);
      } catch (error) {
        console.error("4D Cron job error:", error);
      }
    })
  }
}