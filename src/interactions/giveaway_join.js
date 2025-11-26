import { EmbedBuilder } from 'discord.js';
import { getGiveaway, addGiveawayEntry, getGiveawayEntries } from '../utils/database.js';

export default {
  customId: /^giveaway_join_(\d+)$/,
  async execute(interaction) {
    try {
      const giveawayId = parseInt(interaction.customId.split('_')[2]);
      const giveaway = getGiveaway(giveawayId);

      if (!giveaway) {
        return interaction.reply({
          content: '❌ Giveaway tidak ditemukan.',
          flags: 64,
        });
      }

      if (new Date(giveaway.ends_at) < new Date()) {
        return interaction.reply({
          content: '❌ Giveaway ini sudah berakhir.',
          flags: 64,
        });
      }

      if (giveaway.creator_id === interaction.user.id) {
        return interaction.reply({
          content: '❌ Anda tidak bisa ikut di giveaway Anda sendiri!',
          flags: 64,
        });
      }

      try {
        addGiveawayEntry(giveawayId, interaction.user.id);

        const entries = getGiveawayEntries(giveawayId);
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('✅ Berhasil Ikut!')
          .setDescription(`Anda telah terdaftar di giveaway **${giveaway.prize}**`)
          .addFields(
            { name: 'Total Peserta', value: `\`${entries.length}\`` },
            { name: 'Hadiah', value: giveaway.prize },
            { name: 'Berakhir', value: `<t:${Math.floor(new Date(giveaway.ends_at).getTime() / 1000)}:R>` }
          );

        await interaction.reply({ embeds: [embed], flags: 64 });
      } catch (error) {
        // Already entered
        return interaction.reply({
          content: '❌ Anda sudah terdaftar di giveaway ini!',
          flags: 64,
        });
      }
    } catch (error) {
      console.error('Error joining giveaway:', error);
      try {
        await interaction.reply({
          content: '❌ Terjadi kesalahan.',
          flags: 64,
        });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
