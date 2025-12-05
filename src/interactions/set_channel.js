import { EmbedBuilder } from 'discord.js';
import { setGuildSetting, getGuildSettings, loadGuildSettings } from '../utils/database.js';

export default {
  customId: /^set_channel_(welcome|goodbye|logs|suggestions|giveaways)_\d+$/,
  async execute(interaction) {
    try {
      await interaction.deferUpdate();
      const parts = interaction.customId.split('_');
      const channelType = parts[2];
      const selectedChannelId = parts[3];

      const columnMap = {
        welcome: 'welcome_channel',
        goodbye: 'goodbye_channel',
        logs: 'logs_channel',
        suggestions: 'suggestions_channel',
        giveaways: 'giveaway_channel',
      };

      const columnName = columnMap[channelType];
      const currentSettings = getGuildSettings(interaction.guildId) || {};

      // Check if this channel type is already set
      const isCurrentlySet = currentSettings[columnName] === selectedChannelId;

      // Toggle: if already set to this channel, unset it; otherwise set it
      const newValue = isCurrentlySet ? null : selectedChannelId;

      await setGuildSetting(interaction.guildId, {
        [columnName]: newValue,
      });
      await loadGuildSettings(interaction.guildId);

      const titles = {
        welcome: '👋 Welcome Channel',
        goodbye: '👋 Goodbye Channel',
        logs: '📋 Logs Channel',
        suggestions: '💬 Suggestions Channel',
        giveaways: '🎁 Giveaway Channel',
      };

      const embed = new EmbedBuilder()
        .setColor(newValue ? 'Green' : 'Red')
        .setTitle(`${newValue ? '✅' : '❌'} ${titles[channelType]} ${newValue ? 'Updated' : 'Unset'}`)
        .setDescription(newValue ? `Channel set to <#${selectedChannelId}>` : `Channel unset - no longer configured`);

      await interaction.followUp({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Error in set_channel handler:', error);
      try {
        await interaction.followUp({ content: '❌ Terjadi kesalahan saat menyimpan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
