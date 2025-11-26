import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createGiveaway, getActiveGiveaways } from '../utils/database.js';
import { requireAdmin } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Kelola giveaway')
    .setDefaultMemberPermissions(8)
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Buat giveaway baru')
        .addStringOption(option =>
          option.setName('prize')
            .setDescription('Hadiah giveaway')
            .setRequired(true)
            .setMaxLength(100)
        )
        .addIntegerOption(option =>
          option.setName('duration')
            .setDescription('Durasi giveaway dalam menit')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10080)
        )
        .addIntegerOption(option =>
          option.setName('winners')
            .setDescription('Jumlah pemenang')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Deskripsi hadiah')
            .setRequired(false)
            .setMaxLength(200)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lihat giveaway aktif')
    ),
  async execute(interaction) {
    try {
      if (!requireAdmin(interaction.member)) {
        return interaction.reply({
          content: '❌ Hanya admin yang dapat membuat giveaway!',
          flags: 64,
        });
      }

      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guildId;

      if (subcommand === 'create') {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        const winners = interaction.options.getInteger('winners') || 1;
        const description = interaction.options.getString('description') || '';

        const endsAt = new Date(Date.now() + duration * 60000).toISOString();

        const result = createGiveaway(
          guildId,
          interaction.user.id,
          prize,
          description,
          endsAt,
          winners,
          interaction.channelId
        );

        const embed = new EmbedBuilder()
          .setColor('Gold')
          .setTitle('🎁 GIVEAWAY!')
          .setDescription(`**Hadiah:** ${prize}`)
          .addFields(
            { name: 'Deskripsi', value: description || 'Tidak ada deskripsi', inline: false },
            { name: 'Durasi', value: `\`${duration}\` menit`, inline: true },
            { name: 'Pemenang', value: `\`${winners}\``, inline: true }
          )
          .setFooter({ text: 'Klik tombol di bawah untuk ikut!' })
          .setTimestamp(new Date(endsAt));

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`giveaway_join_${result.lastInsertRowid}`)
            .setLabel('🎉 Ikut Giveaway')
            .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
      } else if (subcommand === 'list') {
        const giveaways = getActiveGiveaways(guildId);

        if (!giveaways || giveaways.length === 0) {
          return interaction.reply({
            content: '❌ Tidak ada giveaway aktif di server ini.',
            flags: 64,
          });
        }

        const embed = new EmbedBuilder()
          .setColor('Gold')
          .setTitle('🎁 Giveaway Aktif')
          .setDescription(`Total: ${giveaways.length} giveaway`)
          .addFields(
            giveaways.slice(0, 10).map((g, i) => ({
              name: `#${i + 1} - ${g.prize}`,
              value: `Pemenang: \`${g.winners_count}\` | Berakhir: <t:${Math.floor(new Date(g.ends_at).getTime() / 1000)}:R>`,
              inline: false,
            }))
          );

        await interaction.reply({ embeds: [embed], flags: 64 });
      }
    } catch (error) {
      console.error('Giveaway command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat mengelola giveaway.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
