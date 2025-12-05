import { EmbedBuilder, ChannelType } from 'discord.js';
import { createTicket } from '../utils/database.js';
import { randomBytes } from 'crypto';

const generateTicketId = () => {
  return `TK-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
};

export default {
  customId: 'ticket_topic_select',
  async execute(interaction) {
    try {
      const topic = interaction.values[0];
      const ticketId = generateTicketId();
      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      await interaction.deferReply({ flags: 64 });

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${ticketId.toLowerCase()}`,
        type: ChannelType.GuildText,
        topic: `Ticket ID: ${ticketId} | User: ${interaction.user.username} | Topic: ${topic}`,
        permissionOverwrites: [
          {
            id: guildId,
            deny: ['ViewChannel'],
          },
          {
            id: userId,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      createTicket(ticketId, guildId, userId, ticketChannel.id);

      const topicNames = {
        bug: '🐛 Bug Report',
        feature: '💡 Feature Request',
        question: '❓ Question',
        report: '⚠️ Report User',
        billing: '💰 Billing'
      };

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`🎫 Ticket Dibuat - ${ticketId}`)
        .setDescription(
          `**Topic:** ${topicNames[topic]}\n\n` +
          `Halo ${interaction.user.toString()}! 👋\n\n` +
          `Tim support kami akan segera membantu Anda.\n` +
          `Silakan jelaskan masalah atau pertanyaan Anda dengan detail.`
        )
        .addFields(
          { name: 'Ticket ID', value: `\`${ticketId}\``, inline: true },
          { name: 'Status', value: '🟢 OPEN', inline: true },
          { name: 'Dibuat', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: 'Klik tombol di bawah untuk menutup ticket' })
        .setTimestamp();

      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
      const closeButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`ticket_close_${ticketId}`)
            .setLabel('Tutup Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

      await ticketChannel.send({
        content: `${interaction.user.toString()} - Support Team akan segera membantu!`,
        embeds: [embed],
        components: [closeButton],
      });

      const replyEmbed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('✅ Ticket Berhasil Dibuat')
        .setDescription(`Channel ticket: ${ticketChannel.toString()}\nSilakan cek channel tersebut!`);

      await interaction.editReply({ embeds: [replyEmbed] });
    } catch (error) {
      console.error('Ticket topic select error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat membuat ticket.');
      
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], flags: 64 });
      }
    }
  },
};