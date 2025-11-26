import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');

    try {
      await member.timeout(null);
      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('✓ Member Unmuted')
        .setDescription(`${member.user.tag} has been unmuted.`)
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to unmute member.',
        flags: 64,
      });
    }
  },
};

