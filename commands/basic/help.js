const { readdirSync } = require("fs")
const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("help")
  .setDescription("list all commands"),

  async execute(interaction, client) {


      let categories = []
      readdirSync("./commands/").forEach((dir) => {
        const commands = readdirSync(`./commands/${dir}/`).filter((file) =>
          file.endsWith(".js")
        );

        const cmds = commands.map((command) => {
          let file = require(`../../commands/${dir}/${command}`);

          let name = file.data.name.replace(".js", "");

          return `\`/${name}\``;
        });

        let data = new Object();

        data = {
          name: dir.toUpperCase(),
          value: cmds.length === 0 ? "In progress." : cmds.join(" "),
        };

        categories.push(data);
      });

      const listEmbed = new EmbedBuilder()
      .setTitle("Commands List")
      .addFields(categories)
      .setColor(0x00FFFF)

      interaction.reply({ content:" ", embeds:[listEmbed] })
  }
}