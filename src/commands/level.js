import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevelData, getLevelingLeaderboard } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Lihat level dan experience')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Pengguna untuk dicek')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guildId;

      const levelData = getLevelData(guildId, targetUser.id);
      const leaderboard = getLevelingLeaderboard(guildId, 10);

      const level = levelData?.level || 1;
      const experience = levelData?.experience || 0;
      const nextLevelXp = level * 100; // 100 XP per level
      const progressPercent = Math.floor((experience / nextLevelXp) * 100);

      // Find rank in leaderboard
      let rank = 'N/A';
      if (leaderboard) {
        const index = leaderboard.findIndex(u => u.user_id === targetUser.id);
        if (index !== -1) rank = `#${index + 1}`;
      }

      const embed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle(`🎮 Level ${level}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: 'Pengguna', value: `${targetUser.username}`, inline: true },
          { name: 'Rank', value: rank, inline: true },
          { name: 'Experience', value: `\`${experience} / ${nextLevelXp}\` XP`, inline: false },
          { name: 'Progress', value: `${'█'.repeat(Math.floor(progressPercent / 5))}${'░'.repeat(20 - Math.floor(progressPercent / 5))} ${progressPercent}%`, inline: false }
        )
        .setFooter({ text: 'Gain XP dengan mengirim pesan dan menggunakan command!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Level command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengambil data level.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
