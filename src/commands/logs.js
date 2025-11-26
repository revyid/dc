import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLogs } from '../utils/database.js';
import { requireModerator } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Lihat moderation logs')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User untuk di-filter')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Jumlah logs yang ditampilkan (1-20)')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      if (!requireModerator(interaction.member)) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Akses Ditolak')
          .setDescription('Hanya moderator yang dapat melihat logs.');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const user = interaction.options.getUser('user');
      const limit = interaction.options.getInteger('limit') || 10;

      let logs = getLogs(interaction.guildId, 50);

      if (user) {
        logs = logs.filter(log => log.user_id === user.id).slice(0, limit);
      } else {
        logs = logs.slice(0, limit);
      }

      if (logs.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('Yellow')
          .setTitle('📋 No Logs Found')
          .setDescription(user ? `Tidak ada logs untuk ${user}` : 'Tidak ada logs di server ini');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('📋 Moderation Logs')
        .setDescription(user ? `Logs untuk ${user.toString()}` : `${logs.length} logs terbaru`)
        .setTimestamp();

      logs.forEach((log, index) => {
        const action = log.action.toUpperCase();
        const reason = log.reason || 'No reason';
        const date = new Date(log.created_at).toLocaleDateString('id-ID');
        embed.addFields({
          name: `#${index + 1} - ${action}`,
          value: `**User:** <@${log.user_id}>\n**Moderator:** <@${log.moderator_id}>\n**Reason:** ${reason}\n**Date:** ${date}`,
          inline: false,
        });
      });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Logs command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengambil logs.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
