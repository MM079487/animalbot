const { loadCommands } = require("../../handlers/commandHandler");
const { autoCountdown } = require("../../handlers/autoCountdown");
const { sendEarthquakeReport } = require("../../handlers/sendEarthquakeReport.js");
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

    sendEarthquakeReport(client)


  }
}