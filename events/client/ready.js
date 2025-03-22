const { loadCommands } = require("../../handlers/commandHandler");
const { autoCountdown } = require("../../handlers/autoCountdown");
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

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout exceeded")), 60000) // 60s timeout
    );
    
    cron.schedule("0 0 * * *", async function () {
      try {
        postTime("cronjob triggered");
        await Promise.race([autoCountdown(client), timeoutPromise]);
      } catch (error) {
        console.error("Cron job error:", error);
      }
    });
  }
}