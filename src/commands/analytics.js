import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('analytics')
    .setDescription('View detailed server analytics & insights')
    .addSubcommand(subcommand =>
      subcommand
        .setName('overview')
        .setDescription('Server overview analytics')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('growth')
        .setDescription('Member growth & trends')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('moderation')
        .setDescription('Moderation activity trends')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('activity')
        .setDescription('User activity breakdown')
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'overview') {
        const stats = db.prepare(`
          SELECT 
            COUNT(DISTINCT user_id) as active_users,
            SUM(messages_sent) as total_messages,
            SUM(commands_used) as total_commands,
            AVG(messages_sent) as avg_messages,
            AVG(commands_used) as avg_commands
          FROM user_statistics
          WHERE guild_id = ?
        `).get(interaction.guildId);

        const modStats = db.prepare(`
          SELECT
            COUNT(*) as total_actions,
            COUNT(DISTINCT user_id) as warned_users,
            SUM(CASE WHEN action = 'warn' THEN 1 ELSE 0 END) as total_warns,
            SUM(CASE WHEN action = 'kick' THEN 1 ELSE 0 END) as total_kicks,
            SUM(CASE WHEN action = 'ban' THEN 1 ELSE 0 END) as total_bans,
            SUM(CASE WHEN action = 'mute' THEN 1 ELSE 0 END) as total_mutes
          FROM member_logs
          WHERE guild_id = ?
        `).get(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle('📊 Server Overview Analytics')
          .setThumbnail(interaction.guild.iconURL({ size: 256 }))
          .addFields(
            { name: '👥 Active Users', value: stats?.active_users?.toString() || '0', inline: true },
            { name: '💬 Total Messages', value: stats?.total_messages?.toString() || '0', inline: true },
            { name: '⚡ Commands Used', value: stats?.total_commands?.toString() || '0', inline: true },
            { name: '📈 Avg Messages/User', value: Math.round(stats?.avg_messages || 0).toString(), inline: true },
            { name: '📈 Avg Commands/User', value: Math.round(stats?.avg_commands || 0).toString(), inline: true },
            { name: '━━━━━━━━━━━━━━━', value: ' ', inline: false },
            { name: '⚠️ Total Warnings', value: modStats?.total_warns?.toString() || '0', inline: true },
            { name: '🚫 Total Kicks', value: modStats?.total_kicks?.toString() || '0', inline: true },
            { name: '🔨 Total Bans', value: modStats?.total_bans?.toString() || '0', inline: true },
            { name: '🔇 Total Mutes', value: modStats?.total_mutes?.toString() || '0', inline: true },
            { name: '👤 Warned Users', value: modStats?.warned_users?.toString() || '0', inline: true },
          )
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'growth') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const weekUsers = db.prepare(`
          SELECT COUNT(DISTINCT user_id) as count FROM user_statistics
          WHERE guild_id = ? AND joined_at >= ?
        `).get(interaction.guildId, weekAgo);

        const monthUsers = db.prepare(`
          SELECT COUNT(DISTINCT user_id) as count FROM user_statistics
          WHERE guild_id = ? AND joined_at >= ?
        `).get(interaction.guildId, monthAgo);

        const totalUsers = db.prepare(`
          SELECT COUNT(DISTINCT user_id) as count FROM user_statistics
          WHERE guild_id = ?
        `).get(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('📈 Member Growth Analytics')
          .setDescription('Track your server growth over time')
          .addFields(
            { name: '📅 This Week', value: weekUsers?.count?.toString() || '0', inline: true },
            { name: '📅 This Month', value: monthUsers?.count?.toString() || '0', inline: true },
            { name: '📅 Total Members', value: totalUsers?.count?.toString() || '0', inline: true },
            { name: '📊 Growth Rate', value: monthUsers?.count ? `${Math.round((monthUsers.count / (totalUsers?.count || 1)) * 100)}%` : 'N/A', inline: true },
          )
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'moderation') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const weekActions = db.prepare(`
          SELECT COUNT(*) as count FROM member_logs
          WHERE guild_id = ? AND created_at >= ?
        `).get(interaction.guildId, weekAgo);

        const monthActions = db.prepare(`
          SELECT COUNT(*) as count FROM member_logs
          WHERE guild_id = ? AND created_at >= ?
        `).get(interaction.guildId, monthAgo);

        const topModerators = db.prepare(`
          SELECT moderator_id, COUNT(*) as actions
          FROM member_logs
          WHERE guild_id = ?
          GROUP BY moderator_id
          ORDER BY actions DESC
          LIMIT 5
        `).all(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor('Orange')
          .setTitle('⚖️ Moderation Activity Trends')
          .addFields(
            { name: '📊 This Week', value: weekActions?.count?.toString() || '0', inline: true },
            { name: '📊 This Month', value: monthActions?.count?.toString() || '0', inline: true },
            { name: '━━━━━━━━━━━━━━━', value: ' ', inline: false },
            { name: '🛡️ Top Moderators', value: topModerators.length > 0 ? topModerators.map((m, i) => `${i + 1}. <@${m.moderator_id}> - ${m.actions} actions`).join('\n') : 'No data', inline: false }
          )
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'activity') {
        const topUsers = db.prepare(`
          SELECT user_id, messages_sent, commands_used
          FROM user_statistics
          WHERE guild_id = ?
          ORDER BY messages_sent DESC
          LIMIT 10
        `).all(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor('Purple')
          .setTitle('📊 Top Active Users')
          .setDescription('Most active members by message count')
          .addFields({
            name: '🏆 Top 10',
            value: topUsers.length > 0 ? topUsers.map((u, i) => `${i + 1}. <@${u.user_id}> - ${u.messages_sent} messages, ${u.commands_used} commands`).join('\n') : 'No data',
            inline: false
          })
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }
    } catch (error) {
      console.error('Analytics command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengambil analytics.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
