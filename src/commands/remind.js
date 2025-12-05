import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createReminder } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('What to remind you about')
        .setRequired(true)
        .setMaxLength(500)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Minutes from now')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const duration = interaction.options.getInteger('duration');
    const remindAt = new Date(Date.now() + duration * 60 * 1000).toISOString();

    try {
      await createReminder(interaction.user.id, interaction.guildId, message, remindAt);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('⏰ Reminder Set')
        .setDescription(`I'll remind you in **${duration}** minute${duration === 1 ? '' : 's'}!`)
        .addFields({ name: 'Message', value: message, inline: false })
        .setFooter({ text: `Reminder for ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Remind command error:', error);
      await interaction.reply({ content: '❌ Failed to set reminder.', flags: 64 });
    }
  },
};
