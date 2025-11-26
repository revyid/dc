import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getTopActiveUsers, getGuildStatistics } from '../utils/statistics.js';

export default {
  data: new SlashCommandBuilder()
    .setName('teststats')
    .setDescription('Test user statistics and analytics'),
  async execute(interaction) {
    try {
      const guildId = interaction.guildId;
      
      // Get top active users
      const topUsers = getTopActiveUsers(guildId, 10);
      const guildStats = getGuildStatistics(guildId);

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('📊 Statistics Test')
        .addFields(
          {
            name: 'Guild Statistics',
            value: `Active Users: ${guildStats?.active_users || 0}\nTotal Messages: ${guildStats?.total_messages || 0}\nTotal Commands: ${guildStats?.total_commands || 0}`,
            inline: false,
          },
          {
            name: 'Top 10 Users',
            value: topUsers.length > 0 
              ? topUsers.map((u, i) => `${i + 1}. <@${u.user_id}> - ${u.messages_sent} messages, ${u.commands_used} commands`).join('\n')
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
