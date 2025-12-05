import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { addWarning, getWarnings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for warning').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  moderatorOnly: true,
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (!targetUser) {
      return interaction.reply({ content: '❌ User not found.', flags: 64 });
    }

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot warn yourself.', flags: 64 });
    }

    try {
      await addWarning(interaction.guildId, targetUser.id, interaction.user.id, reason);
      const warnings = await getWarnings(interaction.guildId, targetUser.id);

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('⚠️ Member Warned')
        .setDescription(`${targetUser.tag} has been warned.`)
        .addFields(
          { name: 'Reason', value: reason, inline: false },
          { name: 'Total Warnings', value: warnings.length.toString(), inline: true }
        )
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });

      try {
        await targetUser.send({
          embeds: [{
            color: 0xf39c12,
            title: '⚠️ You have been warned',
            description: `You received a warning in **${interaction.guild.name}**.`,
            fields: [
              { name: 'Reason', value: reason, inline: false },
              { name: 'Total Warnings', value: warnings.length.toString(), inline: true },
            ],
          }],
        });
      } catch (error) { }
    } catch (error) {
      console.error('Warn command error:', error);
      await interaction.reply({ content: '❌ Failed to warn member.', flags: 64 });
    }
  },
};
