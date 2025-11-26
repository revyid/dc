import { EmbedBuilder } from 'discord.js';
import { setGuildSetting } from '../utils/database.js';

export default {
  customId: 'settings_reset',
  async execute(interaction) {
    try {
      // Use setGuildSetting instead of direct DELETE to respect foreign keys
      setGuildSetting(interaction.guildId, {
        welcome_channel: null,
        goodbye_channel: null,
        logs_channel: null,
        suggestions_channel: null,
        giveaway_channel: null,
        prefix: '!',
        auto_role: null,
        max_warnings: 3,
        anti_spam_enabled: 0,
        anti_spam_cooldown: 5,
        leveling_enabled: 0,
        reputation_enabled: 1,
        auto_mod_enabled: 0,
        max_mentions_spam: 5,
        notification_role: null,
        welcome_message: null,
        goodbye_message: null,
      });

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('🔄 Pengaturan Direset')
        .setDescription('Semua pengaturan server telah dikembalikan ke default');

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Settings reset error:', error);
      try {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Error')
          .setDescription('Gagal mereset pengaturan.');
        await interaction.reply({ embeds: [embed], flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
