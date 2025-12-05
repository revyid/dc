import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('devbadge')
    .setDescription('Developer Badge Management')
    .addSubcommand(subcommand =>
      subcommand.setName('status').setDescription('Check developer badge status')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('info').setDescription('Get info about Active Developer Badge')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Setup badge configuration (Owner only)')
        .addStringOption(option =>
          option.setName('app_id').setDescription('Your Discord App ID').setRequired(true)
        )
        .addChannelOption(option =>
          option.setName('dev_news_channel').setDescription('Channel for developer news').setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'status') {
        const settings = getGuildSettings(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🏆 Developer Badge Status')
          .setDescription('Active Developer Badge Information')
          .addFields(
            {
              name: '📱 App ID Configured',
              value: settings?.dev_app_id ? '✅ Yes' : '❌ No',
              inline: true,
            },
            {
              name: '📢 Dev News Channel',
              value: settings?.dev_news_channel ? `\u003c#${settings.dev_news_channel}>` : '❌ Not set',
              inline: true,
            },
            {
              name: '📋 Requirements',
              value: '• Active application (used command in last 30 days)\\n• Community server designated\\n• Dev news channel set\\n• \"Use data to improve Discord\" enabled in privacy settings',
              inline: false,
            }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'info') {
        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🏆 Active Developer Badge')
          .setDescription('Information about the Active Developer Badge program')
          .addFields(
            {
              name: '✨ What is it?',
              value: 'A badge to recognize developers and teams with active applications on Discord',
              inline: false,
            },
            {
              name: '✅ Requirements',
              value: '1. Own or be on a team with at least one active app\\n2. App must have executed a command in the last 30 days\\n3. Server set as Community Server\\n4. Have admin permissions in that server',
              inline: false,
            },
            {
              name: '📞 Commands That Count',
              value: 'Only application commands count:\\n• Slash Commands (/)\\n• Context Menu Commands',
              inline: false,
            }
          )
          .setFooter({ text: 'Join the Active Developer Program in the Developer Portal!' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (subcommand === 'setup') {
        const isOwner = interaction.guild.ownerId === interaction.user.id;

        if (!isOwner) {
          return interaction.reply({ content: '❌ Only the server owner can setup badge configuration.', flags: 64 });
        }

        const appId = interaction.options.getString('app_id');
        const devNewsChannel = interaction.options.getChannel('dev_news_channel');

        if (!/^\\d{17,19}$/.test(appId)) {
          return interaction.reply({ content: '❌ App ID must be a valid Discord application ID (17-19 digits).', flags: 64 });
        }

        const { setGuildSetting } = await import('../utils/database.js');
        await setGuildSetting(interaction.guildId, {
          dev_app_id: appId,
          dev_news_channel: devNewsChannel.id,
          dev_badge_enabled: true,
          dev_setup_date: new Date().toISOString(),
        });

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle('✅ Badge Configuration Set')
          .setDescription('Developer Badge configuration has been saved!')
          .addFields(
            { name: '📱 App ID', value: appId, inline: true },
            { name: '📢 Dev News Channel', value: `\u003c#${devNewsChannel.id}>`, inline: true },
            { name: '📋 Next Steps', value: '1. Visit Discord Developer Portal\\n2. Select your app\\n3. Designate this server as Community Server\\n4. Choose the dev news channel\\n5. Claim your badge!', inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('DevBadge command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', flags: 64 });
    }
  },
};
