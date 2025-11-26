import { EmbedBuilder } from 'discord.js';

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

export default {
  customId: 'quiz_0',
  async execute(interaction, client) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    const selectedIndex = 0;
    const isCorrect = selectedIndex === q.correct;

    const embed = new EmbedBuilder()
      .setColor(isCorrect ? 0x27ae60 : 0xe74c3c)
      .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
      .setDescription(`The correct answer is: **${q.answers[q.correct]}**`);

    await interaction.update({ embeds: [embed], components: [] });
  },
};
