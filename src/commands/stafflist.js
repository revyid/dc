import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildRoles } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stafflist')
    .setDescription('Show list of server staff members')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    try {
      const roles = getGuildRoles(interaction.guildId) || {};
      const guild = interaction.guild;

      const staffCategories = [];

      const addStaffCategory = (roleName, roleId) => {
        if (!roleId) return;
        const role = guild.roles.cache.get(roleId);
        if (!role) return;
        const members = role.members.map(m => m.user.tag).join(', ') || 'None';
        staffCategories.push({ name: roleName, value: members, inline: false });
      };

      addStaffCategory('👑 Owners', roles.owner_role_id);
      addStaffCategory('🎖️ Co-Owners', roles.co_owner_role_id);
      addStaffCategory('⭐ Admins', roles.admin_role_id);
      addStaffCategory('🛡️ Moderators', roles.moderator_role_id);
      addStaffCategory('👮 Staff', roles.staff_role_id);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('👥 Server Staff')
        .setDescription('List of all staff members in this server')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: `${guild.name}` });

      if (staffCategories.length > 0) {
        embed.addFields(...staffCategories);
      } else {
        embed.setDescription('No staff roles configured.');
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Stafflist command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch staff list.', flags: 64 });
    }
  },
};
