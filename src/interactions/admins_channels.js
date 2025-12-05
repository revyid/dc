import { ChannelSelectMenuBuilder, ActionRowBuilder } from 'discord.js';

export default {
  customId: /^settings_channels$/,
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 64 });
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('select_settings_channel')
        .setPlaceholder('Pilih channel untuk dikonfigurasi')
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(channelSelect);

      await interaction.editReply({
        content: '📝 Pilih channel mana yang ingin diatur:\n\n**Channels Available:**\n👋 Welcome - Welcome message channel\n👋 Goodbye - Goodbye message channel\n📋 Logs - Moderation logs channel\n💬 Suggestions - Suggestions box\n🎁 Giveaways - Giveaway announcements',
        components: [row],
        flags: 64,
      });
    } catch (error) {
      console.error('Error in settings_channels:', error);
      try {
        await interaction.editReply({ content: '❌ Terjadi kesalahan.', flags: 64 });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  },
};
