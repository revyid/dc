import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const choices = { rock: 0, paper: 1, scissors: 2 };
const choiceNames = ['Rock', 'Paper', 'Scissors'];
const emojis = ['🪨', '📄', '✂️'];

export default {
  customId: 'rps_rock',
  async execute(interaction, client) {
    await handleRPS(interaction, 'rock');
  },
};

async function handleRPS(interaction, userChoice) {
  const botChoiceNum = Math.floor(Math.random() * 3);
  const userChoiceNum = choices[userChoice];

  let result;
  if (userChoiceNum === botChoiceNum) {
    result = "It's a tie!";
  } else if (
    (userChoiceNum === 0 && botChoiceNum === 2) ||
    (userChoiceNum === 1 && botChoiceNum === 0) ||
    (userChoiceNum === 2 && botChoiceNum === 1)
  ) {
    result = 'You win! 🎉';
  } else {
    result = 'Bot wins! 🤖';
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('rps_rock')
        .setLabel('🪨 Rock')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('rps_paper')
        .setLabel('📄 Paper')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('rps_scissors')
        .setLabel('✂️ Scissors')
        .setStyle(ButtonStyle.Primary),
    );

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🎮 Rock Paper Scissors')
    .addFields(
      { name: 'Your choice', value: `${emojis[userChoiceNum]} ${choiceNames[userChoiceNum]}`, inline: true },
      { name: 'Bot choice', value: `${emojis[botChoiceNum]} ${choiceNames[botChoiceNum]}`, inline: true },
      { name: 'Result', value: result, inline: false },
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

global.handleRPS = handleRPS;
