import { EmbedBuilder } from 'discord.js';
import { setGuildSetting } from '../utils/database.js';

export default {
  customId: 'settings_reset',
  async execute(interaction) {
    try {
      // Reset all settings to default
      setGuildSetting(interaction.guildId, {
        welcome_channel: null,
        goodbye_channel: null,
        logs_channel: null,
        prefix: '!',
        auto_role: null,
        max_warnings: 3,
        anti_spam_enabled: 0,
        anti_spam_cooldown: 5,
        leveling_enabled: 0,
        reputation_enabled: 1,
        suggestions_channel: null,
        giveaway_channel: null,
        auto_mod_enabled: 0,
        max_mentions_spam: 5,
        notification_role: null,
      });

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('⚠️ Reset Pengaturan')
        .setDescription('Semua pengaturan server telah direset ke default.')
        .addFields(
          { name: 'Prefix', value: '`!`' },
          { name: 'Max Warnings', value: '`3`' },
          { name: 'Anti-Spam Cooldown', value: '`5s`' },
          { name: 'Max Mentions', value: '`5`' }
        );

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Error resetting settings:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Gagal mereset pengaturan.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
