const dailyCounts = require("../../dailyCounts")

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (message.author.bot) return;

        // counted in memory, saved to MongoDB every few seconds ($inc), never touches a local file
        dailyCounts.record(message)
    },
}
