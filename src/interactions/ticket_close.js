import { EmbedBuilder } from 'discord.js';
import { closeTicket } from '../utils/database.js';

export default {
  customId: /^ticket_close_/,
  async execute(interaction) {
    try {
      const ticketId = interaction.customId.split('_')[2];

      closeTicket(ticketId);

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('🔒 Ticket Ditutup')
        .setDescription(
          `Ticket \`${ticketId}\` telah ditutup oleh ${interaction.user.toString()}.\n\n` +
          `Channel ini akan dihapus dalam **5 detik**...`
        )
        .setFooter({ text: `Ditutup oleh ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    } catch (error) {
      console.error('Ticket close error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat menutup ticket.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};