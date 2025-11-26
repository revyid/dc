import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  customId: 'settings_features',
  async execute(interaction) {
    try {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('toggle_antispam')
            .setLabel('🛡️ Anti-Spam')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('toggle_leveling')
            .setLabel('🎮 Leveling')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('toggle_reputation')
            .setLabel('⭐ Reputation')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('toggle_automod')
            .setLabel('🤖 Auto-Mod')
            .setStyle(ButtonStyle.Primary),
        );

      await interaction.reply({
        content: '🔧 Pilih fitur untuk di-toggle:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Error in settings_features:', error);
      try {
        await interaction.reply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
