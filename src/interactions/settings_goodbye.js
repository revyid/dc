import { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import { setGuildSetting } from '../utils/database.js';

export default {
  customId: 'settings_goodbye',
  async execute(interaction) {
    try {
      const selectMenu = new ChannelSelectMenuBuilder()
        .setCustomId('select_goodbye_channel')
        .setPlaceholder('Pilih kanal goodbye')
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Pilih kanal untuk goodbye messages:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Settings goodbye error:', error);
    }
  },
};

export const selectGoodbyeHandler = {
  customId: 'select_goodbye_channel',
  async execute(interaction) {
    try {
      const channel = interaction.values[0];
      setGuildSetting(interaction.guildId, { goodbye_channel: channel });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Goodbye Channel Diatur')
        .setDescription(`Kanal goodbye telah diatur ke <#${channel}>`);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Select goodbye channel error:', error);
    }
  },
};
