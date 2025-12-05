import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a role')
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to get info about').setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const permissions = role.permissions.toArray().join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(role.color)
      .setTitle(`📌 ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Members', value: role.members.size.toString(), inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `\u003ct:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
