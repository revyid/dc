import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a role')
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to get info for').setRequired(true)
    ),
  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x808080)
      .setTitle(`🏷️ Role Information`)
      .addFields(
        { name: 'Role Name', value: role.name, inline: true },
        { name: 'Role ID', value: role.id, inline: true },
        { name: 'Color', value: `#${role.color.toString(16).toUpperCase().padStart(6, '0')}`, inline: true },
        { name: 'Permissions', value: role.permissions.toArray().slice(0, 5).join(', ') || 'No permissions', inline: false },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Members', value: (await interaction.guild.members.fetch()).filter(m => m.roles.cache.has(role.id)).size.toString(), inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
