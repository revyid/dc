import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role to a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to add role to').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to add').setRequired(true)
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

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${member.user.tag} already has the ${role.name} role.`,
        flags: 64,
      });
    }

    try {
      await member.roles.add(role);
      await interaction.reply({
        content: `✓ Added **${role.name}** role to ${member.user.tag}`,
        flags: 64,
      });
    } catch (error) {
      console.error('Add role error:', error);
      await interaction.reply({
        content: '❌ Failed to add role. Check my role position and permissions.',
        flags: 64,
      });
    }
  },
};
