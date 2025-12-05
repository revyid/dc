import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { createTicket } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket'),
  async execute(interaction) {
    const ticketId = `ticket-${interaction.user.id}-${Date.now()}`;

    try {
      const channel = await interaction.guild.channels.create({
        name: ticketId,
        type: 0,
        parent: interaction.channel.parent,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: interaction.client.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      await createTicket(ticketId, interaction.guildId, interaction.user.id, channel.id);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🎫 Support Ticket')
        .setDescription('Thank you for creating a support ticket! A staff member will assist you shortly.')
        .setFooter({ text: 'Click the button below to close this ticket' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `\u003c@${interaction.user.id}>`, embeds: [embed], components: [row] });

      await interaction.reply({
        content: `✓ Ticket created: ${channel}`,
        flags: 64,
      });
    } catch (error) {
      console.error('Ticket command error:', error);
      await interaction.reply({ content: '❌ Failed to create ticket.', flags: 64 });
    }
  },
};