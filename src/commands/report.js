import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user or issue')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for report')
        .setRequired(true)
        .setMaxLength(500)
    )
    .addUserOption(option =>
      option.setName('user').setDescription('User to report').setRequired(false)
    ),
  async execute(interaction) {
    const reason = interaction.options.getString('reason');
    const reportedUser = interaction.options.getUser('user');
    const settings = getGuildSettings(interaction.guildId) || {};
    const logsChannel = settings.logs_channel;

    if (!logsChannel) {
      return interaction.reply({
        content: '❌ Reports channel is not configured.',
        flags: 64,
      });
    }

    try {
      const channel = await interaction.guild.channels.fetch(logsChannel);

      if (!channel) {
        return interaction.reply({ content: '❌ Reports channel not found.', flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🚨 New Report')
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          { name: 'Reporter', value: `\u003c@${interaction.user.id}>`, inline: true },
          { name: 'Reported User', value: reportedUser ? `\u003c@${reportedUser.id}>` : 'General Issue', inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Report ID: ${Date.now()}` });

      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: '✓ Your report has been submitted to the staff team.',
        flags: 64,
      });
    } catch (error) {
      console.error('Report command error:', error);
      await interaction.reply({ content: '❌ Failed to submit report.', flags: 64 });
    }
  },
};
