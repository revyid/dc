import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLeaderboard, getLevelingLeaderboard } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Lihat leaderboard komunitas')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Tipe leaderboard')
        .setRequired(false)
        .addChoices(
          { name: 'Reputation', value: 'reputation' },
          { name: 'Leveling', value: 'leveling' }
        )
    ),
  async execute(interaction) {
    try {
      const type = interaction.options.getString('type') || 'reputation';
      const guildId = interaction.guildId;

      let leaderboardData, embed;

      if (type === 'leveling') {
        leaderboardData = getLevelingLeaderboard(guildId, 10);
        embed = new EmbedBuilder()
          .setColor('Gold')
          .setTitle('🎮 Leveling Leaderboard')
          .setDescription('Top 10 users by level & experience');

        if (leaderboardData && leaderboardData.length > 0) {
          const fields = leaderboardData.map((user, index) => ({
            name: `#${index + 1} - Level ${user.level}`,
            value: `<@${user.user_id}> • XP: \`${user.experience}\``,
            inline: false,
          }));
          embed.addFields(fields);
        } else {
          embed.setDescription('Belum ada data leveling.');
        }
      } else {
        leaderboardData = getLeaderboard(guildId, 10);
        embed = new EmbedBuilder()
          .setColor('Purple')
          .setTitle('⭐ Reputation Leaderboard')
          .setDescription('Top 10 users by reputation points');

        if (leaderboardData && leaderboardData.length > 0) {
          const fields = leaderboardData.map((user, index) => ({
            name: `#${index + 1} - ${user.reputation_points} Points`,
            value: `<@${user.user_id}> • 👍 ${user.total_upvotes} | 👎 ${user.total_downvotes}`,
            inline: false,
          }));
          embed.addFields(fields);
        } else {
          embed.setDescription('Belum ada data reputation.');
        }
      }

      embed.setFooter({ text: `Guild: ${interaction.guild.name}` });
      embed.setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Leaderboard command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat memuat leaderboard.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
