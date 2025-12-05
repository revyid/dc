import { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import { setGuildSetting, loadGuildSettings } from '../utils/database.js';

export default {
  customId: 'settings_logs',
  async execute(interaction) {
    try {
      const selectMenu = new ChannelSelectMenuBuilder()
        .setCustomId('select_logs_channel')
        .setPlaceholder('Pilih kanal logs')
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Pilih kanal untuk moderation logs:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Settings logs error:', error);
    }
  },
};

export const selectLogsHandler = {
  customId: 'select_logs_channel',
  async execute(interaction) {
    try {
      const channel = interaction.values[0];
      await setGuildSetting(interaction.guildId, { logs_channel: channel });
      await loadGuildSettings(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Logs Channel Diatur')
        .setDescription(`Kanal logs telah diatur ke <#${channel}>`);

      await interaction.deferUpdate();
      await interaction.followUp({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Select logs channel error:', error);
    }
  },
};
