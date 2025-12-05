import { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'ticket_panel_open',
  async execute(interaction) {
    try {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_topic_select')
        .setPlaceholder('🎫 Pilih topik ticket...')
        .addOptions([
          {
            label: 'Bug Report',
            description: 'Laporkan bug atau error yang ditemukan',
            value: 'bug',
            emoji: '🐛'
          },
          {
            label: 'Feature Request',
            description: 'Usulkan fitur atau improvement baru',
            value: 'feature',
            emoji: '💡'
          },
          {
            label: 'Question',
            description: 'Pertanyaan umum tentang server',
            value: 'question',
            emoji: '❓'
          },
          {
            label: 'Report User',
            description: 'Laporkan user yang melanggar aturan',
            value: 'report',
            emoji: '⚠️'
          },
          {
            label: 'Billing',
            description: 'Pertanyaan seputar pembayaran',
            value: 'billing',
            emoji: '💰'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('📋 Pilih Topik Ticket')
        .setDescription('Silakan pilih topik yang sesuai dengan keperluan Anda dari menu di bawah.')
        .setFooter({ text: 'Menu akan expired dalam 5 menit' });

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: 64
      });
    } catch (error) {
      console.error('Ticket panel open error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat membuka ticket panel.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};