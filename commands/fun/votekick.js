const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ComponentType,
} = require("discord.js")
const { addBan } = require("../../functions/votekickBans")

// ---- Settings ----
const MIN_HUMANS = 3                      // 2 or fewer humans in the channel -> votekick is blocked
const VOTE_TIME_MS = 30 * 1000            // how long the vote stays open
const BAN_DURATION_MS = 10 * 60 * 1000    // how long a kicked user can't rejoin voice (10 min)
const STARTER_COOLDOWN_MS = 60 * 1000     // cooldown per user for starting a votekick
// ------------------

const activeVotes = new Set()       // voice channel ids that have a vote running
const starterCooldown = new Map()   // userId -> timestamp when they can start another

const humansIn = (channel) => channel.members.filter((m) => !m.user.bot)

// No setDefaultMemberPermissions: anyone can use this command.
module.exports = {
  data: new SlashCommandBuilder()
    .setName("votekick")
    .setDescription("Start a vote to kick a user from your voice channel")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to votekick").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason (optional)").setMaxLength(100)
    ),

  async execute(interaction, client) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "Use this in a server.", ephemeral: true })
    }

    const starter = interaction.member
    const target = interaction.options.getMember("user")
    const reason = interaction.options.getString("reason") ?? "No reason given"

    // --- Validation ---
    const channel = starter.voice.channel
    if (!channel) {
      return interaction.reply({ content: "Join a voice channel first.", ephemeral: true })
    }
    if (!target) {
      return interaction.reply({ content: "That user is not in this server.", ephemeral: true })
    }
    if (target.user.bot) {
      return interaction.reply({ content: "You can't votekick a bot.", ephemeral: true })
    }
    if (target.voice.channelId !== channel.id) {
      return interaction.reply({ content: "That user is not in your voice channel.", ephemeral: true })
    }
    if (humansIn(channel).size < MIN_HUMANS) {
      return interaction.reply({
        content: `Votekick needs at least ${MIN_HUMANS} people in the voice channel.`,
        ephemeral: true,
      })
    }
    // This is the BOT's permission (needed to disconnect someone), not the user's.
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return interaction.reply({ content: "I need the **Move Members** permission to do that.", ephemeral: true })
    }
    if (activeVotes.has(channel.id)) {
      return interaction.reply({ content: "A votekick is already running in this channel.", ephemeral: true })
    }
    const cdEnds = starterCooldown.get(starter.id) ?? 0
    if (Date.now() < cdEnds) {
      const secs = Math.ceil((cdEnds - Date.now()) / 1000)
      return interaction.reply({ content: `Wait ${secs}s before starting another votekick.`, ephemeral: true })
    }

    // --- Vote setup ---
    activeVotes.add(channel.id)
    starterCooldown.set(starter.id, Date.now() + STARTER_COOLDOWN_MS)

    // Voters = humans in the channel except the target. Simple majority needed.
    const eligible = humansIn(channel).filter((m) => m.id !== target.id).size
    const required = Math.floor(eligible / 2) + 1

    // The starter counts as the first vote, unless they votekicked themselves
    // (the target can never vote, so a self-votekick has to be decided by the others).
    const votes = new Set(starter.id === target.id ? [] : [starter.id])
    const endsAt = Math.floor((Date.now() + VOTE_TIME_MS) / 1000)

    const buildEmbed = (status) =>
      new EmbedBuilder()
        .setTitle("🗳️ Votekick")
        .setColor(status ? "Grey" : "Red")
        .setDescription(
          status ??
            `Kick **${target.displayName}** from **${channel.name}**?\n` +
              `Reason: ${reason}\n\n` +
              `Votes: **${votes.size}/${required}**\n` +
              `Ends <t:${endsAt}:R>`
        )

    const row = (disabled = false) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("votekick_yes")
          .setLabel("Vote kick")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled)
      )

    await interaction.reply({ embeds: [buildEmbed()], components: [row()] })
    const message = await interaction.fetchReply()

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: VOTE_TIME_MS,
    })

    collector.on("collect", async (i) => {
      const current = i.guild.channels.cache.get(channel.id)

      if (i.user.id === target.id) {
        return i.reply({ content: "You can't vote in your own votekick.", ephemeral: true })
      }
      if (!current?.members.has(i.user.id)) {
        return i.reply({ content: "Only people in the voice channel can vote.", ephemeral: true })
      }
      if (votes.has(i.user.id)) {
        return i.reply({ content: "You already voted.", ephemeral: true })
      }

      votes.add(i.user.id)
      await i.deferUpdate()

      if (votes.size >= required) {
        collector.stop("passed")
      } else {
        await interaction.editReply({ embeds: [buildEmbed()] }).catch(() => {})
      }
    })

    collector.on("end", async (_collected, endReason) => {
      activeVotes.delete(channel.id)

      if (endReason !== "passed") {
        return interaction
          .editReply({
            embeds: [buildEmbed(`Vote failed: not enough votes (${votes.size}/${required}).`)],
            components: [row(true)],
          })
          .catch(() => {})
      }

      // Re-check at the moment of kicking
      const freshTarget = await interaction.guild.members.fetch(target.id).catch(() => null)
      const stillThere = freshTarget?.voice.channelId === channel.id
      const stillEnough = humansIn(channel).size >= MIN_HUMANS

      if (!stillThere || !stillEnough) {
        return interaction
          .editReply({
            embeds: [buildEmbed("Vote cancelled: the channel changed before the kick.")],
            components: [row(true)],
          })
          .catch(() => {})
      }

      try {
        await freshTarget.voice.disconnect(`Votekicked (${votes.size} votes): ${reason}`)
        addBan(interaction.guild.id, target.id, BAN_DURATION_MS)
        await interaction
          .editReply({
            embeds: [
              buildEmbed(
                `**${target.displayName}** was votekicked and can't rejoin voice for ` +
                  `${Math.round(BAN_DURATION_MS / 60000)} minutes.`
              ),
            ],
            components: [row(true)],
          })
          .catch(() => {})
      } catch (err) {
        console.error("votekick disconnect failed:", err)
        await interaction
          .editReply({
            embeds: [buildEmbed("Vote passed, but I couldn't disconnect that user.")],
            components: [row(true)],
          })
          .catch(() => {})
      }
    })
  },
}
