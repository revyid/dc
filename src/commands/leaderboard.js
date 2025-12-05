import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevelingLeaderboard } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View server leaderboard'),
  async execute(interaction) {
    try {
      const leaderboard = await getLevelingLeaderboard(interaction.guildId, 10);

      if (leaderboard.length === 0) {
        return interaction.reply({ content: '📊 No leaderboard data yet.', flags: 64 });
      }

      const description = await Promise.all(
        leaderboard.map(async(entry, i) => {
          const user = await interaction.client.users.fetch(entry.user_id).catch(() => null);
          const username = user ? user.tag : 'Unknown User';
          const level = entry.level || 1;
          const xp = entry.experience || 0;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
          return `${medal} ${username} - Level ${level} (${xp} XP)`;
        })
      );

      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('🏆 Server Leaderboard')
        .setDescription(description.join('\\n'))
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'Top 10 members by level' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Leaderboard command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch leaderboard.', flags: 64 });
    }
  },
};
