import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getLogs } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View server moderation logs')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of logs to show (default: 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(50)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),
  moderatorOnly: true,
  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;

    try {
      const logs = await getLogs(interaction.guildId, limit);

      if (logs.length === 0) {
        return interaction.reply({
          content: '📋 No logs found.',
          flags: 64,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('📋 Moderation Logs')
        .setDescription(
          logs.map((log, i) => {
            const date = new Date(log.created_at).toLocaleString();
            return `**${i + 1}.** \u003c@${log.user_id}> - ${log.action}\\n*${log.reason}* | ${date}`;
          }).join('\\n\\n')
        )
        .setFooter({ text: `Showing ${logs.length} most recent logs` });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Logs command error:', error);
      await interaction.reply({ content: '❌ Failed to fetch logs.', flags: 64 });
    }
  },
};