import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { addLog } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report user untuk misconduct')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User yang di-report')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Alasan report')
        .setRequired(true)
        .addChoices(
          { name: '🔊 Spam', value: 'spam' },
          { name: '😠 Harassment', value: 'harassment' },
          { name: '🔞 NSFW', value: 'nsfw' },
          { name: '🔗 Phishing', value: 'phishing' },
          { name: '💬 Inappropriate Language', value: 'inappropriate' },
          { name: '🎮 Cheating', value: 'cheating' },
          { name: 'ℹ️ Lainnya', value: 'other' },
        )
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Deskripsi detail (opsional)')
        .setRequired(false)
        .setMaxLength(200)
    ),
  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const description = interaction.options.getString('description') || 'No description provided';

      if (targetUser.id === interaction.user.id) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Tidak Bisa Report Diri Sendiri')
          .setDescription('Anda tidak bisa melakukan report terhadap diri sendiri.');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (targetUser.bot) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Tidak Bisa Report Bot')
          .setDescription('Anda tidak bisa melakukan report terhadap bot.');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const reasonEmoji = {
        'spam': '🔊',
        'harassment': '😠',
        'nsfw': '🔞',
        'phishing': '🔗',
        'inappropriate': '💬',
        'cheating': '🎮',
        'other': 'ℹ️',
      };

      const reasonText = {
        'spam': 'Spam',
        'harassment': 'Harassment',
        'nsfw': 'NSFW Content',
        'phishing': 'Phishing',
        'inappropriate': 'Inappropriate Language',
        'cheating': 'Cheating',
        'other': 'Other',
      };

      addLog(
        interaction.guildId,
        targetUser.id,
        'report',
        `Report dari ${interaction.user.username}: ${reasonText[reason]} - ${description}`,
        interaction.user.id
      );

      const userEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('📋 Report Submitted')
        .setDescription(`Report Anda untuk ${targetUser} telah diterima.`)
        .addFields(
          { name: 'Alasan', value: `${reasonEmoji[reason]} ${reasonText[reason]}`, inline: true },
          { name: 'Status', value: 'Pending Review', inline: true }
        );

      await interaction.reply({ embeds: [userEmbed], flags: 64 });

      const modEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('🚨 New User Report')
        .setDescription(`New report submitted by ${interaction.user.toString()}`)
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Reported User', value: `${targetUser} (${targetUser.id})`, inline: true },
          { name: '👤 Reporter', value: `${interaction.user} (${interaction.user.id})`, inline: true },
          { name: '📁 Alasan', value: `${reasonEmoji[reason]} ${reasonText[reason]}`, inline: false },
          { name: '📝 Deskripsi', value: description, inline: false },
          { name: '🕐 Waktu', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        );

      const guild = interaction.guild;
      const logsChannel = guild.channels.cache.find(ch => ch.name === 'mod-logs' || ch.name === 'logs');

      if (logsChannel && logsChannel.isTextBased()) {
        await logsChannel.send({ embeds: [modEmbed] }).catch(console.error);
      }
    } catch (error) {
      console.error('Report command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat submit report.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
