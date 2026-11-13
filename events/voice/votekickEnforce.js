const { getRemaining } = require("../../functions/votekickBans")

// Separate file on purpose: your event loader registers every file in events/
// as its own listener, so this runs alongside voiceActivityTrack.js without touching it.
module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    // Only care about someone joining or moving into a channel
    if (!newState.channelId || newState.channelId === oldState.channelId) return
    if (newState.member?.user.bot) return

    const remaining = getRemaining(newState.guild.id, newState.id)
    if (remaining <= 0) return

    await newState.disconnect("Votekick ban still active").catch(() => {})

    const mins = Math.ceil(remaining / 60000)
    newState.member
      .send(`You were votekicked and can't join voice channels for another ~${mins} min.`)
      .catch(() => {}) // DMs may be closed
  },
}
