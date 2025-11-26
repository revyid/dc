import { EmbedBuilder } from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../utils/database.js';

export default {
  customId: 'toggle_automod',
  async execute(interaction) {
    try {
      const settings = getGuildSettings(interaction.guildId) || {};
      const newState = !settings.auto_mod_enabled;

      setGuildSetting(interaction.guildId, {
        auto_mod_enabled: newState ? 1 : 0,
      });

      const embed = new EmbedBuilder()
        .setColor(newState ? 'Green' : 'Red')
        .setTitle('🤖 Auto-Moderation')
        .setDescription(`Auto-Mod sekarang: ${newState ? '✅ **ENABLED**' : '❌ **DISABLED**'}`);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Error toggling auto-mod:', error);
      try {
        await interaction.reply({ content: '❌ Gagal mengubah pengaturan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
