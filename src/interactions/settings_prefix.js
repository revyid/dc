import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { setGuildSetting, loadGuildSettings } from '../utils/database.js';

export default {
  customId: 'settings_prefix',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('modal_prefix')
        .setTitle('Ubah Prefix');

      const prefixInput = new TextInputBuilder()
        .setCustomId('prefix_input')
        .setLabel('Prefix Baru (contoh: ! atau /)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(5)
        .setMinLength(1);

      const row = new ActionRowBuilder().addComponents(prefixInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Settings prefix error:', error);
    }
  },
};

export const prefixModalHandler = {
  customId: 'modal_prefix',
  async execute(interaction) {
    try {
      const prefix = interaction.fields.getTextInputValue('prefix_input');
      await setGuildSetting(interaction.guildId, { prefix });
      await loadGuildSettings(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Prefix Diubah')
        .setDescription(`Prefix baru: \`${prefix}\``);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Prefix modal error:', error);
    }
  },
};
