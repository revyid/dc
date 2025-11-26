import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  customId: 'select_settings_channel',
  async execute(interaction) {
    try {
      const selectedChannelId = interaction.values[0];
      const channel = interaction.guild.channels.cache.get(selectedChannelId);
      const channelName = channel?.name || 'Unknown';
      const settings = getGuildSettings(interaction.guildId) || {};

      const buttons = [];
      
      // Define all channel types with their current values
      const channelTypes = [
        { 
          type: 'welcome', 
          label: '👋 Welcome', 
          style: ButtonStyle.Primary,
          current: settings.welcome_channel 
        },
        { 
          type: 'goodbye', 
          label: '👋 Goodbye', 
          style: ButtonStyle.Primary,
          current: settings.goodbye_channel 
        },
        { 
          type: 'logs', 
          label: '📋 Logs', 
          style: ButtonStyle.Primary,
          current: settings.logs_channel 
        },
        { 
          type: 'suggestions', 
          label: '💬 Suggestions', 
          style: ButtonStyle.Secondary,
          current: settings.suggestions_channel 
        },
        { 
          type: 'giveaways', 
          label: '🎁 Giveaways', 
          style: ButtonStyle.Secondary,
          current: settings.giveaway_channel 
        },
      ];

      // Create buttons with dynamic labels
      for (const ct of channelTypes) {
        if (ct.current) {
          // If already set, show UNSET option
          buttons.push(
            new ButtonBuilder()
              .setCustomId(`set_channel_${ct.type}_${selectedChannelId}`)
              .setLabel(`${ct.label} (SET)`)
              .setStyle(ButtonStyle.Success)
          );
        } else {
          // If not set, show SET option
          buttons.push(
            new ButtonBuilder()
              .setCustomId(`set_channel_${ct.type}_${selectedChannelId}`)
              .setLabel(`${ct.label} (NOT SET)`)
              .setStyle(ct.style)
          );
        }
      }

      // Split buttons into rows (max 5 per row)
      const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 3));
      const row2 = new ActionRowBuilder().addComponents(buttons.slice(3, 5));

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('📝 Pilih Tipe Channel')
        .setDescription(`Selected: <#${selectedChannelId}> (#${channelName})\n\nGunakan tombol di bawah untuk menentukan tipe channel mana yang akan digunakan:\n\n**Legend:**\n🟢 (SET) = Sudah dikonfigurasi, klik untuk ubah\n🔵 (NOT SET) = Belum dikonfigurasi, klik untuk set`);

      await interaction.reply({ embeds: [embed], components: [row1, row2], flags: 64 });
    } catch (error) {
      console.error('Error in select_settings_channel:', error);
      try {
        await interaction.reply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
