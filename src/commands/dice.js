import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice'),
  async execute(interaction, client) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ['🎲', '⚫', '🔴', '🟡', '⚪', '⭐'];

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('roll_again')
          .setLabel('Roll Again')
          .setStyle(ButtonStyle.Primary),
      );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎲 Dice Roll')
      .setDescription(`You rolled: **${roll}** ${diceEmojis[roll - 1]}`);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
