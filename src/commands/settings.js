import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../utils/database.js';
import { requireAdmin } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Kelola semua pengaturan server')
    .setDefaultMemberPermissions(8),
  async execute(interaction) {
    try {
      if (!requireAdmin(interaction.member)) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Akses Ditolak')
          .setDescription('Hanya admin yang dapat mengakses perintah ini.');
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const settings = getGuildSettings(interaction.guildId) || {};

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('⚙️ Server Settings - Dashboard Lengkap')
        .setDescription('Kelola semua pengaturan server Anda di satu tempat')
        .addFields(
          {
            name: '📝 Channel Management',
            value: `Welcome: ${settings.welcome_channel ? `<#${settings.welcome_channel}>` : '❌ Belum diatur'}\nGoodbye: ${settings.goodbye_channel ? `<#${settings.goodbye_channel}>` : '❌ Belum diatur'}\nLogs: ${settings.logs_channel ? `<#${settings.logs_channel}>` : '❌ Belum diatur'}\nSuggestions: ${settings.suggestions_channel ? `<#${settings.suggestions_channel}>` : '❌ Belum diatur'}\nGiveaways: ${settings.giveaway_channel ? `<#${settings.giveaway_channel}>` : '❌ Belum diatur'}`,
            inline: false,
          },
          {
            name: '🔧 Feature Toggles',
            value: `Anti-Spam: ${settings.anti_spam_enabled ? '✅' : '❌'}\nLeveling: ${settings.leveling_enabled ? '✅' : '❌'}\nReputation: ${settings.reputation_enabled ? '✅' : '❌'}\nAuto-Mod: ${settings.auto_mod_enabled ? '✅' : '❌'}`,
            inline: true,
          },
          {
            name: '⚠️ Moderation Settings',
            value: `Max Warnings: \`${settings.max_warnings || 3}\`\nMentions Limit: \`${settings.max_mentions_spam || 5}\`\nSpam Cooldown: \`${settings.anti_spam_cooldown || 5}s\``,
            inline: true,
          },
          {
            name: '👤 Roles & Messages',
            value: `Auto Role: ${settings.auto_role ? `<@&${settings.auto_role}>` : '❌'}\nNotif Role: ${settings.notification_role ? `<@&${settings.notification_role}>` : '❌'}\nPrefix: \`${settings.prefix || '!'}\``,
            inline: true,
          }
        )
        .setFooter({ text: 'Klik tombol di bawah untuk mengatur setiap kategori' });

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('settings_channels')
            .setLabel('📝 Channels')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('settings_features')
            .setLabel('🔧 Features')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('settings_moderation')
            .setLabel('⚠️ Moderation')
            .setStyle(ButtonStyle.Primary),
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('settings_roles')
            .setLabel('👤 Roles')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('settings_messages')
            .setLabel('💬 Messages')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('settings_reset')
            .setLabel('🔄 Reset All')
            .setStyle(ButtonStyle.Danger),
        );

      await interaction.reply({ embeds: [embed], components: [row1, row2], flags: 64 });
    } catch (error) {
      console.error('Settings command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat membuka settings.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
