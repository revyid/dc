import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  moderatorOnly: true,
  async execute(interaction) {
    const member = interaction.options.getMember('user');

    if (!member) {
      return interaction.reply({ content: '❌ Member not found.', flags: 64 });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        content: '❌ This member is not muted.',
        flags: 64,
      });
    }

    try {
      await member.timeout(null);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🔊 Member Unmuted')
        .setDescription(`${member.user.tag} has been unmuted.`)
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Unmute command error:', error);
      await interaction.reply({ content: '❌ Failed to unmute member.', flags: 64 });
    }
  },
};
