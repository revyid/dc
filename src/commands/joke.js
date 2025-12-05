import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs!',
  'Why did the developer go broke? Because he used up all his cache!',
  'How many programmers does it take to change a light bulb? None, that\'s a hardware problem!',
  'Why do Java developers wear glasses? Because they don\'t C#!',
  'What\'s a programmer\'s favorite hangout place? Foo Bar!',
];

export default {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random programming joke'),
  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('😄 Programming Joke')
      .setDescription(joke)
      .setFooter({ text: 'Hope you laughed!' });

    await interaction.reply({ embeds: [embed] });
  },
};
