import { EmbedBuilder } from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../utils/database.js';

export default {
  customId: 'toggle_reputation',
  async execute(interaction) {
    try {
      const settings = getGuildSettings(interaction.guildId) || {};
      const newState = !settings.reputation_enabled;

      setGuildSetting(interaction.guildId, {
        reputation_enabled: newState ? 1 : 0,
      });

      const embed = new EmbedBuilder()
        .setColor(newState ? 'Green' : 'Red')
        .setTitle('⭐ Reputation System')
        .setDescription(`Reputation sekarang: ${newState ? '✅ **ENABLED**' : '❌ **DISABLED**'}`);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Error toggling reputation:', error);
      try {
        await interaction.reply({ content: '❌ Gagal mengubah pengaturan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
