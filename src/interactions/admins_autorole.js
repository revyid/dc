import { RoleSelectMenuBuilder, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'settings_roles',
  async execute(interaction) {
    try {
      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId('select_admin_autorole')
        .setPlaceholder('Pilih role untuk auto-assign')
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(roleSelect);

      await interaction.reply({
        content: '👤 Pilih role yang akan otomatis diberikan ke member baru:',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Error in settings_roles:', error);
      try {
        await interaction.reply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
