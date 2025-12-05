import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const quizQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correct: 2,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct: 1,
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'],
    correct: 2,
  },
];

export default {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Test your knowledge with a quiz'),
  async execute(interaction) {
    const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    const questionIndex = quizQuestions.indexOf(question);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🧠 Quiz Time!')
      .setDescription(question.question)
      .setFooter({ text: 'Click a button to answer' });

    const row = new ActionRowBuilder().addComponents(
      question.options.map((option, i) =>
        new ButtonBuilder()
          .setCustomId(`quiz_${i}`)
          .setLabel(option)
          .setStyle(ButtonStyle.Primary)
      )
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
