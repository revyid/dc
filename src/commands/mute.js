import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for mute').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  moderatorOnly: true,
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({ content: '❌ Member not found.', flags: 64 });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot mute yourself.', flags: 64 });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ I cannot mute this member. Check my role position.',
        flags: 64,
      });
    }

    try {
      await member.timeout(duration * 60 * 1000, reason);

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle('🔇 Member Muted')
        .setDescription(`${member.user.tag} has been muted for ${duration} minutes.`)
        .addFields({ name: 'Reason', value: reason, inline: false })
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Mute command error:', error);
      await interaction.reply({ content: '❌ Failed to mute member.', flags: 64 });
    }
  },
};
