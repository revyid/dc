import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  customId: 'settings_moderation',
  async execute(interaction) {
    try {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('set_max_warnings')
            .setLabel('⚠️ Max Warnings')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('set_antispam_cooldown')
            .setLabel('⏱️ Anti-Spam Cooldown')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('set_max_mentions')
            .setLabel('💬 Max Mentions')
            .setStyle(ButtonStyle.Primary),
        );

      await interaction.reply({
        content: '⚠️ Pilih pengaturan moderasi yang ingin diubah:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Error in settings_moderation:', error);
      try {
        await interaction.reply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
