const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chart")
        .setDescription("Get daily messages chart url"),
    async execute(interaction, client) {
        const fetch = require("node-fetch")
        const url = "https://uselessfacts.jsph.pl/api/v2/facts/random"

        await interaction.deferReply()

        const embed = new EmbedBuilder()
            .setTitle("Chart URL")
            .setDescription(`https://animal-bot-5hs7.onrender.com/chart/`)
            .setColor("Green")
            interaction.editReply({ embeds:[embed] })

    }
}