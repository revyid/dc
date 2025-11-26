import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  customId: 'flip_again',
  async execute(interaction, client) {
    const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = flip === 'Heads' ? '🪙' : '🪙';

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('flip_again')
          .setLabel('Flip Again')
          .setStyle(ButtonStyle.Primary),
      );

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('🪙 Coin Flip')
      .setDescription(`${emoji} Result: **${flip}**`);

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
