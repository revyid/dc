import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getReputation, addReputation } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reputation')
    .setDescription('Lihat atau kelola reputasi pengguna')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Cek reputasi pengguna')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Pengguna untuk dicek')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('upvote')
        .setDescription('Beri reputasi positif kepada pengguna')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Pengguna yang diberi upvote')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('downvote')
        .setDescription('Beri reputasi negatif kepada pengguna')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Pengguna yang diberi downvote')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guildId;
      const targetUser = interaction.options.getUser('user');

      if (subcommand === 'check') {
        const user = targetUser || interaction.user;
        const rep = getReputation(guildId, user.id);

        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`⭐ Reputasi ${user.username}`)
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: 'Poin', value: `\`${rep?.reputation_points || 0}\``, inline: true },
            { name: 'Upvotes', value: `\`${rep?.total_upvotes || 0}\` 👍`, inline: true },
            { name: 'Downvotes', value: `\`${rep?.total_downvotes || 0}\` 👎`, inline: true }
          );

        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'upvote') {
        if (targetUser.id === interaction.user.id) {
          return interaction.reply({
            content: '❌ Anda tidak bisa upvote diri sendiri!',
            flags: 64,
          });
        }

        addReputation(guildId, targetUser.id, 1);

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('👍 Upvote Berhasil!')
          .setDescription(`${interaction.user.username} memberi upvote kepada ${targetUser.username}`)
          .addField('Poin Baru', `+1 ⭐`);

        return interaction.reply({ embeds: [embed] });
      }

      if (subcommand === 'downvote') {
        if (targetUser.id === interaction.user.id) {
          return interaction.reply({
            content: '❌ Anda tidak bisa downvote diri sendiri!',
            flags: 64,
          });
        }

        addReputation(guildId, targetUser.id, -1);

        const embed = new EmbedBuilder()
          .setColor('Orange')
          .setTitle('👎 Downvote Tercatat')
          .setDescription(`${interaction.user.username} memberi downvote kepada ${targetUser.username}`)
          .addField('Poin Baru', `-1 ⭐`);

        return interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Reputation command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengelola reputasi.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
