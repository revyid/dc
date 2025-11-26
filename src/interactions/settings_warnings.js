import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { setGuildSetting } from '../utils/database.js';

export default {
  customId: 'settings_warnings',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('modal_warnings')
        .setTitle('Ubah Maks Warnings');

      const warningsInput = new TextInputBuilder()
        .setCustomId('warnings_input')
        .setLabel('Jumlah Maksimal Warnings (1-10)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(2)
        .setMinLength(1);

      const row = new ActionRowBuilder().addComponents(warningsInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Settings warnings error:', error);
    }
  },
};

export const warningsModalHandler = {
  customId: 'modal_warnings',
  async execute(interaction) {
    try {
      const input = interaction.fields.getTextInputValue('warnings_input');
      const warnings = parseInt(input);

      if (isNaN(warnings) || warnings < 1 || warnings > 10) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Input Invalid')
          .setDescription('Masukkan angka antara 1-10');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      setGuildSetting(interaction.guildId, { max_warnings: warnings });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Maks Warnings Diubah')
        .setDescription(`Maks warnings: \`${warnings}\``);

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Warnings modal error:', error);
    }
  },
};
