import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { createTicket, getOpenTickets } from '../utils/database.js';
import { randomBytes } from 'crypto';

const generateTicketId = () => {
  return `TK-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
};

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Buat support ticket')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Buat ticket baru')
        .addStringOption(option =>
          option
            .setName('topic')
            .setDescription('Topik ticket')
            .setRequired(true)
            .addChoices(
              { name: '🐛 Bug Report', value: 'bug' },
              { name: '💡 Feature Request', value: 'feature' },
              { name: '❓ Question', value: 'question' },
              { name: '⚠️ Report User', value: 'report' },
              { name: '💰 Billing', value: 'billing' },
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lihat daftar open tickets')
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'create') {
        const topic = interaction.options.getString('topic');
        const ticketId = generateTicketId();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

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

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle(`🎫 Ticket Dibuat - ${ticketId}`)
          .setDescription(`Topic: \`${topic.toUpperCase()}\`\n\nTim support akan merespons dalam waktu singkat.`)
          .addFields(
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Status', value: 'OPEN', inline: true },
          )
          .setTimestamp();

        const closeButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`ticket_close_${ticketId}`)
              .setLabel('Tutup Ticket')
              .setStyle(ButtonStyle.Danger),
          );

        await ticketChannel.send({
          content: `${interaction.user.toString()} Selamat datang di support ticket!`,
          embeds: [embed],
          components: [closeButton],
        });

        const replyEmbed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle('✅ Ticket Berhasil Dibuat')
          .setDescription(`Channel: ${ticketChannel.toString()}`);

        await interaction.reply({ embeds: [replyEmbed], flags: 64 });
      } else if (subcommand === 'list') {
        const tickets = getOpenTickets(interaction.guildId);

        if (tickets.length === 0) {
          const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('🎫 No Open Tickets')
            .setDescription('Tidak ada open tickets saat ini');
          return interaction.reply({ embeds: [embed], flags: 64 });
        }

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle(`🎫 Open Tickets (${tickets.length})`)
          .setTimestamp();

        tickets.forEach((ticket, index) => {
          const createdAt = new Date(ticket.created_at).toLocaleDateString('id-ID');
          embed.addFields({
            name: `${index + 1}. ${ticket.ticket_id}`,
            value: `**Creator:** <@${ticket.creator_id}>\n**Channel:** <#${ticket.channel_id}>\n**Created:** ${createdAt}`,
            inline: false,
          });
        });

        await interaction.reply({ embeds: [embed], flags: 64 });
      }
    } catch (error) {
      console.error('Ticket command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat membuat ticket.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
