import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevelData } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your or someone else\'s profile')
    .addUserOption(option =>
      option.setName('user').setDescription('User to view profile').setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    try {
      const levelData = await getLevelData(interaction.guildId, user.id);
      const level = levelData?.level || 1;
      const experience = levelData?.experience || 0;

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`${user.username}'s Profile`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '🆔 ID', value: user.id, inline: true },
          { name: '📊 Level', value: level.toString(), inline: true },
          { name: '⭐ Experience', value: experience.toString(), inline: true },
          { name: '📅 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
          { name: '📆 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Profile command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch profile.', flags: 64 });
    }
  },
};
