import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevelData } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your or someone else\'s level')
    .addUserOption(option =>
      option.setName('user').setDescription('User to check').setRequired(false)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    try {
      const levelData = await getLevelData(interaction.guildId, targetUser.id);
      const level = levelData?.level || 1;
      const experience = levelData?.experience || 0;
      const nextLevelXP = level * 100;
      const progress = Math.round((experience / nextLevelXP) * 100);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📊 Level Information`)
        .setDescription(`${targetUser.toString()}'s leveling stats`)
        .addFields(
          { name: '📊 Level', value: level.toString(), inline: true },
          { name: '⭐ Experience', value: `${experience}/${nextLevelXP}`, inline: true },
          { name: '📈 Progress', value: `${progress}%`, inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Level command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch level data.', flags: 64 });
    }
  },
};
