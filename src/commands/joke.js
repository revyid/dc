import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const jokes = [
  'Why don\'t scientists trust atoms? Because they make up everything!',
  'Why did the scarecrow win an award? He was outstanding in his field!',
  'What do you call fake spaghetti? An impasta!',
  'Why don\'t eggs tell jokes? They\'d crack each other up!',
  'What\'s orange and sounds like a parrot? A carrot!',
  'Why don\'t skeletons fight each other? They don\'t have the guts!',
  'What do you call a sleeping bull? A dozer!',
  'Why did the math book look sad? Because it had too many problems!',
];

export default {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tell a random joke'),
  async execute(interaction, client) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('😂 Random Joke')
      .setDescription(joke);

    await interaction.reply({ embeds: [embed] });
  },
};
