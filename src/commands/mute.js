import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const parseTime = (str) => {
  const num = parseInt(str);
  if (isNaN(num)) return 10 * 60 * 1000;
  
  if (str.includes('s')) return num * 1000;
  if (str.includes('m')) return num * 60 * 1000;
  if (str.includes('h')) return num * 60 * 60 * 1000;
  if (str.includes('d')) return num * 24 * 60 * 60 * 1000;
  
  return num * 60 * 1000;
};

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration').setDescription('Duration (e.g., 10m, 1h, 1d)').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for mute').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const duration = interaction.options.getString('duration') || '10m';
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({
        content: '❌ Member not found.',
        flags: 64,
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot mute yourself.',
        flags: 64,
      });
    }

    if (member.id === client.user.id) {
      return interaction.reply({
        content: '❌ I cannot mute myself.',
        flags: 64,
      });
    }

    if (member.isCommunicationDisabled()) {
      return interaction.reply({
        content: '❌ This member is already muted.',
        flags: 64,
      });
    }

    try {
      const timeout = parseTime(duration);

      if (timeout > MAX_TIMEOUT) {
        return interaction.reply({
          content: '❌ Mute duration cannot exceed 28 days.',
          flags: 64,
        });
      }

      await member.timeout(timeout, reason);

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✓ Member Muted')
        .setDescription(`${member.user.tag} has been muted.`)
        .addFields(
          { name: 'Duration', value: duration, inline: true },
          { name: 'Reason', value: reason, inline: false },
        )
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Mute command error:', error);
      await interaction.reply({
        content: '❌ Failed to mute member. Please try again.',
        flags: 64,
      });
    }
  },
};

