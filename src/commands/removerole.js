import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to remove role').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to remove').setRequired(true)
    ),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${member.user.tag} doesn't have the **${role.name}** role.`,
        flags: 64,
      });
    }

    try {
      await member.roles.remove(role);
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('✓ Role Removed')
        .setDescription(`Removed **${role.name}** from ${member.user.tag}`)
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to remove role.',
        flags: 64,
      });
    }
  },
};
