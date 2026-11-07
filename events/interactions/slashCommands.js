const { EmbedBuilder } = require("discord.js")

// ids of interactions this process already handled (guards against the same event firing twice)
const handled = new Set()

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    if (handled.has(interaction.id)) return;
    handled.add(interaction.id);
    setTimeout(() => handled.delete(interaction.id), 60 * 1000);

    try {
      const command = client.commands.get(interaction.commandName);
      if (!command) return await interaction.reply({
        content: "Bruh, an error",
        ephemeral: true
      });

      if (command.developer && interaction.user.id != "724335188271955979") return await interaction.reply({
        embeds: [new EmbedBuilder().setTitle("This is a developer command, you kenot use this command you this stupid!").setColor("Red")],
        ephemeral: true
      })

      await command.execute(interaction, client);
    } catch (err) {
      // 10062 = interaction expired (>3s), 40060 = already answered (e.g. by another running instance)
      if (err.code === 10062 || err.code === 40060) {
        return console.warn(`/${interaction.commandName}: interaction can't be answered (${err.code})`);
      }

      console.error(`❌ /${interaction.commandName} failed:`, err);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: "Something went wrong running that command, try again." });
        } else {
          await interaction.reply({ content: "Something went wrong running that command, try again.", ephemeral: true });
        }
      } catch (_) { /* nothing more we can do */ }
    }
  }
}
