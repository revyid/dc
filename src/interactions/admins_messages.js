import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  customId: 'settings_messages',
  async execute(interaction) {
    try {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('set_welcome_msg')
            .setLabel('👋 Welcome Message')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('set_goodbye_msg')
            .setLabel('👋 Goodbye Message')
            .setStyle(ButtonStyle.Primary),
        );

      await interaction.reply({
        content: '💬 Pilih pesan yang ingin dikustomisasi:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Error in settings_messages:', error);
      try {
        await interaction.reply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
