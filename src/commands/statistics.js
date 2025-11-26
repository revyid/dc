import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('statistics')
    .setDescription('Lihat statistik server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User untuk di-filter')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');

      if (user) {
        const stmt = db.prepare(`
          SELECT * FROM user_statistics 
          WHERE guild_id = ? AND user_id = ?
        `);
        const stats = stmt.get(interaction.guildId, user.id);

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle(`📊 User Statistics - ${user.username}`)
          .addFields(
            { name: '💬 Messages Sent', value: stats?.messages_sent.toString() || '0', inline: true },
            { name: '⚡ Commands Used', value: stats?.commands_used.toString() || '0', inline: true },
            { name: '📅 Joined At', value: stats?.joined_at ? new Date(stats.joined_at).toLocaleDateString('id-ID') : 'Unknown', inline: true },
            { name: '🕐 Last Message', value: stats?.last_message ? new Date(stats.last_message).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Never', inline: true },
          )
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      const totalMembers = interaction.guild.memberCount;
      const statsStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_users,
          SUM(messages_sent) as total_messages,
          SUM(commands_used) as total_commands
        FROM user_statistics 
        WHERE guild_id = ?
      `);
      const guildStats = statsStmt.get(interaction.guildId);

      const warningsStmt = db.prepare(`
        SELECT COUNT(*) as total_warnings FROM member_warnings WHERE guild_id = ?
      `);
      const warnings = warningsStmt.get(interaction.guildId);

      const logsStmt = db.prepare(`
        SELECT COUNT(*) as total_logs FROM member_logs WHERE guild_id = ?
      `);
      const logs = logsStmt.get(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle(`📊 Server Statistics - ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL({ size: 256 }))
        .addFields(
          { name: '👥 Total Members', value: totalMembers.toString(), inline: true },
          { name: '📝 Active Users', value: (guildStats?.total_users || 0).toString(), inline: true },
          { name: '💬 Total Messages', value: (guildStats?.total_messages || 0).toString(), inline: true },
          { name: '⚡ Commands Used', value: (guildStats?.total_commands || 0).toString(), inline: true },
          { name: '⚠️ Total Warnings', value: warnings?.total_warnings.toString() || '0', inline: true },
          { name: '📋 Total Logs', value: logs?.total_logs.toString() || '0', inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Statistics command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengambil statistik.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
