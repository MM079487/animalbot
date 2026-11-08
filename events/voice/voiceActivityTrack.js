const voiceCounts = require("../../voiceCounts")

// Set to false if you only want to count people joining from "not in voice" (ignores switching channels)
const COUNT_CHANNEL_SWITCHES = true

module.exports = {
    name: "voiceStateUpdate",
    async execute(oldState, newState, client) {
        const member = newState.member || oldState.member
        if (!member || member.user.bot) return

        // not in a voice channel after this update (left) -> nothing to count
        if (!newState.channelId) return

        // mute / deafen / stream / camera toggles keep the same channel -> not a join
        if (oldState.channelId === newState.channelId) return

        // moved from another voice channel
        if (oldState.channelId && !COUNT_CHANNEL_SWITCHES) return

        voiceCounts.record()
    },
}
