import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { addWarning, getWarnings, getGuildSettings } from '../utils/database.js';
import { autoModerate, checkWarningThreshold } from '../utils/automod.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for warning').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot warn yourself.',
        flags: 64,
      });
    }

    if (member.user.bot) {
      return interaction.reply({
        content: '❌ You cannot warn a bot.',
        flags: 64,
      });
    }

    addWarning(interaction.guildId, member.id, interaction.user.id, reason);

    const threshold = checkWarningThreshold(interaction.guildId, member.id);

    let description = `${member.user.tag} has been warned.`;
    if (threshold) {
      description += `\n\n⚠️ **Warnings: ${threshold.current}/${threshold.max}**`;
      if (threshold.willBan) {
        description += ' - **AUTO-BAN TRIGGERED**';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⚠️ Member Warned')
      .setDescription(description)
      .addFields(
        { name: 'Reason', value: reason, inline: false },
        threshold && !threshold.willBan ? { name: '⚠️ Next Action', value: `${threshold.nextCount} more warning(s) until auto-ban`, inline: false } : null
      )
      .filter(f => f !== null)
      .setFooter({ text: `By ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });

    const dmEmbed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⚠️ You have been warned!')
      .setDescription(`You were warned in **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason', value: reason, inline: false },
        { name: 'Warned by', value: interaction.user.tag, inline: false },
        threshold ? { name: 'Warnings', value: `${threshold.current}/${threshold.max}`, inline: true } : null
      )
      .filter(f => f !== null);

    member.send({ embeds: [dmEmbed] }).catch(() => {});

    await autoModerate(interaction.guildId, member.id, interaction.user.id, reason, client);
  },
};

