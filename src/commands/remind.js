import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createReminder } from '../utils/database.js';

const parseTime = (timeStr) => {
  const match = timeStr.match(/(\d+)([smhd])/);
  if (!match) return null;

  const amount = parseInt(match[1]);
  const unit = match[2];

  let ms = 0;
  switch (unit) {
    case 's':
      ms = amount * 1000;
      break;
    case 'm':
      ms = amount * 60 * 1000;
      break;
    case 'h':
      ms = amount * 60 * 60 * 1000;
      break;
    case 'd':
      ms = amount * 24 * 60 * 60 * 1000;
      break;
  }

  return Date.now() + ms;
};

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder untuk nanti')
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('Waktu reminder (contoh: 5m, 1h, 2d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Pesan reminder')
        .setRequired(true)
        .setMaxLength(100)
    ),
  async execute(interaction) {
    try {
      const timeStr = interaction.options.getString('time');
      const message = interaction.options.getString('message');

      const remindAt = parseTime(timeStr);

      if (!remindAt) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Format Invalid')
          .setDescription('Format: `5s`, `10m`, `1h`, `2d`');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const now = Date.now();
      if (remindAt <= now) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Time Invalid')
          .setDescription('Waktu reminder harus di masa depan!');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const timeMs = remindAt - now;
      const days = Math.floor(timeMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((timeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((timeMs % (60 * 60 * 1000)) / (60 * 1000));

      let timeDisplay = '';
      if (days > 0) timeDisplay += `${days}d `;
      if (hours > 0) timeDisplay += `${hours}h `;
      if (minutes > 0) timeDisplay += `${minutes}m`;

      createReminder(interaction.user.id, interaction.guildId, message, new Date(remindAt).toISOString());

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Reminder Set')
        .setDescription(`Anda akan diingatkan dalam: **${timeDisplay.trim()}**`)
        .addFields(
          { name: '📝 Pesan', value: message, inline: false },
          { name: '⏰ Waktu', value: `<t:${Math.floor(remindAt / 1000)}:F>`, inline: false }
        );

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Remind command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat set reminder.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
