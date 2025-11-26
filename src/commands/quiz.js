import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Play a quick quiz!'),
  async execute(interaction, client) {
    const questions = [
      {
        question: 'What is the capital of France?',
        answers: ['Paris', 'London', 'Berlin', 'Madrid'],
        correct: 0,
      },
      {
        question: 'What is 2 + 2?',
        answers: ['3', '4', '5', '6'],
        correct: 1,
      },
      {
        question: 'What is the largest planet in our solar system?',
        answers: ['Saturn', 'Venus', 'Jupiter', 'Neptune'],
        correct: 2,
      },
    ];

    const q = questions[Math.floor(Math.random() * questions.length)];

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`quiz_0`)
          .setLabel(q.answers[0])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`quiz_1`)
          .setLabel(q.answers[1])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`quiz_2`)
          .setLabel(q.answers[2])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`quiz_3`)
          .setLabel(q.answers[3])
          .setStyle(ButtonStyle.Primary),
      );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎓 Quick Quiz')
      .setDescription(q.question);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  },
};
