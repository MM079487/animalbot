const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maren")
    .setDescription("help u fak people")
    .addUserOption((option) => 
      option
        .setName("user")
        .setDescription("who u want to fak")
        .setRequired(true)
      ),
  execute(interaction, client){
    const fetch = require("node-fetch")
    const userId = interaction.options.getMember('user').id

    async function fetchInsults() {
      try {
        const response = await fetch('https://raw.githubusercontent.com/pokemonchw/Dirty/master/Insult.txt');

        if (!response.ok) {
          throw new Error('Failed to fetch insults');
        }

        const text = await response.text();
        return text.split('\n'); // Split the text into an array of lines
      } catch (error) {
        console.error('Error fetching insults:', error.message);
        return [];
      }
    }

    // Function to pick a random line from an array
    function getRandomLine(lines) {
      const randomIndex = Math.floor(Math.random() * lines.length);
      return lines[randomIndex];
    }

    // Example usage
    async function getRandomInsult() {
      const lines = await fetchInsults();

      if (lines.length > 0) {
        const randomInsult = getRandomLine(lines);
        interaction.reply(`<@${userId}> ${randomInsult}`);
      } else {
        console.log('No insults available.');
      }
    }

    // Call the function to get a random insult
    getRandomInsult()

  }
}