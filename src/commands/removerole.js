import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to remove role from').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to remove').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  moderatorOnly: true,
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member) {
      return interaction.reply({ content: '❌ Member not found.', flags: 64 });
    }

    if (!role) {
      return interaction.reply({ content: '❌ Role not found.', flags: 64 });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${member.user.tag} doesn't have the ${role.name} role.`,
        flags: 64,
      });
    }

    try {
      await member.roles.remove(role);
      await interaction.reply({
        content: `✓ Removed **${role.name}** role from ${member.user.tag}`,
        flags: 64,
      });
    } catch (error) {
      console.error('Remove role error:', error);
      await interaction.reply({
        content: '❌ Failed to remove role. Check my role position and permissions.',
        flags: 64,
      });
    }
  },
};
