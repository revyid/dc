import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings, loadGuildSettings, setGuildSetting, getGuildRoles } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Manage server settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  adminOnly: true,
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 64 });
      await loadGuildSettings(interaction.guildId);
      const settings = getGuildSettings(interaction.guildId) || {};
      const roles = getGuildRoles(interaction.guildId) || {};

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('⚙️ Server Settings Dashboard')
        .setDescription('Comprehensive server configuration panel')
        .addFields(
          {
            name: '📝 Channels',
            value: `Welcome: ${settings.welcome_channel ? `\u003c#${settings.welcome_channel}>` : '❌'}\nGoodbye: ${settings.goodbye_channel ? `\u003c#${settings.goodbye_channel}>` : '❌'}\nLogs: ${settings.logs_channel ? `\u003c#${settings.logs_channel}>` : '❌'}\nSuggestions: ${settings.suggestions_channel ? `\u003c#${settings.suggestions_channel}>` : '❌'}`,
            inline: true,
          },
          {
            name: '🔧 Features',
            value: `Anti-Spam: ${settings.anti_spam_enabled ? '✅' : '❌'}\nLeveling: ${settings.leveling_enabled ? '✅' : '❌'}\nReputation: ${settings.reputation_enabled ? '✅' : '❌'}\nAuto-Mod: ${settings.auto_mod_enabled ? '✅' : '❌'}`,
            inline: true,
          },
          {
            name: '👑 Staff Roles',
            value: `Admin: ${roles.admin_role_id ? `\u003c@\u0026${roles.admin_role_id}>` : '❌'}\nModerator: ${roles.moderator_role_id ? `\u003c@\u0026${roles.moderator_role_id}>` : '❌'}\nStaff: ${roles.staff_role_id ? `\u003c@\u0026${roles.staff_role_id}>` : '❌'}`,
            inline: true,
          }
        )
        .setFooter({ text: 'Click buttons below to configure' });

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('settings_channels')
          .setLabel('📝 Channels')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('settings_features')
          .setLabel('🔧 Features')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('settings_roles')
          .setLabel('👑 Roles')
          .setStyle(ButtonStyle.Primary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('settings_moderation')
          .setLabel('⚠️ Moderation')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('settings_messages')
          .setLabel('💬 Messages')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('settings_reset')
          .setLabel('🔄 Reset')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({ embeds: [embed], components: [row1, row2], flags: 64 });
    } catch (error) {
      console.error('Settings command error:', error);
      await interaction.editReply({ content: '❌ Failed to load settings.', flags: 64 });
    }
  },
};