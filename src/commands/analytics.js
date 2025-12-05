import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getActivityLogs } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('analytics')
    .setDescription('View detailed server analytics  insights')
    .addSubcommand(subcommand =>
      subcommand.setName('overview').setDescription('Server overview analytics')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('activity').setDescription('User activity breakdown')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  moderatorOnly: true,
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const allLogs = await getActivityLogs(interaction.guildId, 5000) || [];

      if (subcommand === 'overview') {
        const uniqueUsers = new Set(allLogs.map(log => log.user_id)).size;
        const totalMessages = allLogs.length;
        const avgMessages = uniqueUsers > 0 ? Math.round(totalMessages / uniqueUsers) : 0;

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('📊 Server Analytics Overview')
          .setThumbnail(interaction.guild.iconURL({ size: 256 }))
          .addFields(
            { name: '👥 Active Users', value: uniqueUsers.toString(), inline: true },
            { name: '💬 Total Activity', value: totalMessages.toString(), inline: true },
            { name: '📈 Avg Activity/User', value: avgMessages.toString(), inline: true }
          )
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'activity') {
        const userActivity = {};
        allLogs.forEach(log => {
          if(!userActivity[log.user_id]) {
          userActivity[log.user_id] = 0;
        }
        userActivity[log.user_id]++;
      });

      const topUsers = Object.entries(userActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('📊 Top Active Users')
        .setDescription('Most active members by activity count')
        .addFields({
          name: '🏆 Top 10',
          value: topUsers.length > 0
            ? topUsers.map(([userId, count], i) =>`${i + 1}. \u003c@${userId}> - ${count} activities`).join('\\n')
              : 'No data',
        inline: false
    })
          .setTimestamp();

  return await interaction.reply({ embeds: [embed], flags: 64 });
}
    } catch (error) {
  console.error('Analytics command error:', error);
  await interaction.reply({ content: '❌ Failed to fetch analytics.', flags: 64 });
}
  },
};
