import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getActivityLogs } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('teststats')
    .setDescription('Test user statistics and analytics'),
  async execute(interaction) {
    try {
      const logs = await getActivityLogs(interaction.guildId, 1000) || [];
      const uniqueUsers = new Set(logs.map(log => log.user_id)).size;

      const userActivity = {};
      logs.forEach(log => {
        if(!userActivity[log.user_id]) {
        userActivity[log.user_id] = 0;
      }
      userActivity[log.user_id]++;
    });

    const topUsers = Object.entries(userActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📊 Statistics Test')
      .addFields(
        {
          name: 'Guild Statistics',
          value: `Active Users: ${uniqueUsers}\\nTotal Logs: ${logs.length}`,
          inline: false,
        },
        {
          name: 'Top 10 Users',
          value: topUsers.length > 0
            ? topUsers.map(([userId, count], i) =>`${i + 1}. \u003c@${userId}> - ${count} activities`).join('\\n')
              : 'No data yet',
      inline: false,
          }
        );

  await interaction.reply({ embeds: [embed], flags: 64 });
} catch (error) {
  console.error('Test stats error:', error);
  await interaction.reply({ content: `❌ Error: ${error.message}`, flags: 64 });
}
  },
};
