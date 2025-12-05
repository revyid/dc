import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getActivityLogs } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('statistics')
    .setDescription('View server statistics')
    .addUserOption(option =>
      option.setName('user').setDescription('User to filter').setRequired(false)
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const activityLogs = await getActivityLogs(interaction.guildId, 1000) || [];

      if (user) {
        const userLogs = activityLogs.filter(log => log.user_id === user.id);
        const messageCount = userLogs.length;
        const lastActivity = userLogs[0]?.created_at;

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(`📊 ${user.username}'s Statistics`)
          .addFields(
            { name: '📊 Activity Count', value: messageCount.toString(), inline: true },
            { name: '🕐 Last Activity', value: lastActivity ? `\u003ct:${Math.floor(new Date(lastActivity).getTime() / 1000)}:R>` : 'Never', inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      const totalMembers = interaction.guild.memberCount;
      const uniqueUsers = new Set(activityLogs.map(log => log.user_id)).size;
      const totalLogs = activityLogs.length;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📊 ${interaction.guild.name} Statistics`)
        .setThumbnail(interaction.guild.iconURL({ size: 256 }))
        .addFields(
          { name: '👥 Total Members', value: totalMembers.toString(), inline: true },
          { name: '📝 Active Users', value: uniqueUsers.toString(), inline: true },
          { name: '📋 Total Activity', value: totalLogs.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Statistics command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch statistics.', flags: 64 });
    }
  },
};
