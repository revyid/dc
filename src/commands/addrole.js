import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role to a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to give role').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to add').setRequired(true)
    ),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${member.user.tag} already has the **${role.name}** role.`,
        flags: 64,
      });
    }

    try {
      await member.roles.add(role);
      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('✓ Role Added')
        .setDescription(`Added **${role.name}** to ${member.user.tag}`)
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to add role.',
        flags: 64,
      });
    }
  },
};
