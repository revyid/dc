import { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../utils/database.js';

export default {
  customId: 'settings_welcome',
  async execute(interaction) {
    try {
      const selectMenu = new ChannelSelectMenuBuilder()
        .setCustomId('select_welcome_channel')
        .setPlaceholder('Pilih kanal welcome')
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Pilih kanal untuk welcome messages:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Settings welcome error:', error);
    }
  },
};

export const selectWelcomeHandler = {
  customId: 'select_welcome_channel',
  async execute(interaction) {
    try {
      const channel = interaction.values[0];
      setGuildSetting(interaction.guildId, { welcome_channel: channel });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Welcome Channel Diatur')
        .setDescription(`Kanal welcome telah diatur ke <#${channel}>`);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Select welcome channel error:', error);
    }
  },
};
