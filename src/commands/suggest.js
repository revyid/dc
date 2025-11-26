import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createSuggestion, getSuggestions } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Ajukan saran untuk komunitas')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Isi saran Anda (max 100 karakter)')
        .setRequired(true)
        .setMaxLength(100)
    ),
  async execute(interaction) {
    try {
      const suggestion = interaction.options.getString('suggestion');
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      // Create suggestion
      createSuggestion(guildId, userId, suggestion);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Saran Diterima!')
        .setDescription(`Terima kasih telah mengajukan saran:\n\n"${suggestion}"`)
        .addFields(
          { name: 'Status', value: '⏳ Pending Review' },
          { name: 'ID', value: `\`${userId}\`` }
        )
        .setFooter({ text: 'Admin akan meninjau saran Anda segera' });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Suggest command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Gagal membuat saran. Silakan coba lagi.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
