import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

export default {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors with the bot'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎮 Rock Paper Scissors')
      .setDescription('Choose your move!')
      .setFooter({ text: 'Click a button to play' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rps_rock')
        .setLabel('🪨 Rock')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('rps_paper')
        .setLabel('📄 Paper')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('rps_scissors')
        .setLabel('✂️ Scissors')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
