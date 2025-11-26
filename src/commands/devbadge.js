import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('devbadge')
    .setDescription('Developer Badge Management')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check developer badge status')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Get info about Active Developer Badge')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Setup badge configuration (Owner only)')
        .addStringOption(option =>
          option
            .setName('app_id')
            .setDescription('Your Discord App ID')
            .setRequired(true)
        )
        .addChannelOption(option =>
          option
            .setName('dev_news_channel')
            .setDescription('Channel for developer news')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'status') {
        const settings = getGuildSettings(interaction.guildId);
        
        const embed = new EmbedBuilder()
          .setColor('Blurple')
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
              value: settings?.dev_news_channel ? `<#${settings.dev_news_channel}>` : '❌ Not set',
              inline: true,
            },
            {
              name: '⚡ Eligibility Status',
              value: settings?.dev_app_id ? '✅ Eligible (if commands used in last 30 days)' : '❌ Not configured',
              inline: false,
            },
            {
              name: '📋 Requirements',
              value: '• Active application (used command in last 30 days)\n• Community server designated\n• Dev news channel set\n• "Use data to improve Discord" enabled in privacy settings',
              inline: false,
            }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      if (subcommand === 'info') {
        const embed = new EmbedBuilder()
          .setColor('Gold')
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
              value: '1. Own or be on a team with at least one active app\n2. App must have executed a command in the last 30 days\n3. Server set as Community Server\n4. Have admin permissions in that server',
              inline: false,
            },
            {
              name: '🎯 How to Claim',
              value: '1. Go to Developer Portal\n2. Select your active app\n3. Designate a Community Server\n4. Choose a Developer News Channel\n5. Badge appears on your profile!',
              inline: false,
            },
            {
              name: '⚠️ Maintaining Eligibility',
              value: 'Keep your app active! If inactive for 30 days, you\'ll lose eligibility. You\'ll get a 30-day notice before the badge is removed.',
              inline: false,
            },
            {
              name: '📞 Commands That Count',
              value: 'Only application commands count:\n• Slash Commands (/)\n• Context Menu Commands\n\n❌ Does NOT count:\n• Prefix commands\n• OAuth calls\n• Other API interactions',
              inline: false,
            },
            {
              name: '🔧 Troubleshooting',
              value: 'If you ran a command but it\'s still ineligible:\n• Enable "Use data to improve Discord" in User Settings > Privacy & Safety\n• Wait at least 24 hours\n• Make sure at least one team member has this enabled',
              inline: false,
            }
          )
          .setFooter({ text: 'Join the Active Developer Program in the Developer Portal!' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (subcommand === 'setup') {
        // Check if user is server owner or bot owner
        const isOwner = interaction.user.id === process.env.OWNER_ID || interaction.guild.ownerId === interaction.user.id;
        
        if (!isOwner) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('❌ Permission Denied')
            .setDescription('Only the server owner or bot owner can setup badge configuration.');
          return interaction.reply({ embeds: [embed], flags: 64 });
        }

        const appId = interaction.options.getString('app_id');
        const devNewsChannel = interaction.options.getChannel('dev_news_channel');

        // Validate app ID format (should be numeric snowflake)
        if (!/^\d{17,19}$/.test(appId)) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('❌ Invalid App ID')
            .setDescription('App ID must be a valid Discord application ID (17-19 digits).');
          return interaction.reply({ embeds: [embed], flags: 64 });
        }

        // Store configuration
        const { setGuildSetting } = await import('../utils/database.js');
        setGuildSetting(interaction.guildId, {
          dev_app_id: appId,
          dev_news_channel: devNewsChannel.id,
          dev_badge_enabled: 1,
          dev_setup_date: new Date().toISOString(),
        });

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('✅ Badge Configuration Set')
          .setDescription('Developer Badge auto-enable configuration has been saved!')
          .addFields(
            { name: '📱 App ID', value: appId, inline: true },
            { name: '📢 Dev News Channel', value: `<#${devNewsChannel.id}>`, inline: true },
            { name: '📋 Next Steps', value: '1. Visit Discord Developer Portal\n2. Select your app\n3. Designate this server as Community Server\n4. Choose the dev news channel\n5. Claim your badge!\n\n⚠️ Make sure you have "Use data to improve Discord" enabled in User Settings > Privacy & Safety', inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Send info to dev news channel
        try {
          const channel = await interaction.guild.channels.fetch(devNewsChannel.id);
          const infoEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🏆 Developer Badge Setup Complete')
            .setDescription(`This server has been configured to receive developer news and support the Active Developer Badge program!`)
            .addFields(
              { name: '📱 App ID', value: appId, inline: true },
              { name: '✨ What\'s Next?', value: 'Complete the setup in the Developer Portal to claim your badge!', inline: false }
            );

          await channel.send({ embeds: [infoEmbed] });
        } catch (error) {
          console.error('Failed to send info to dev news channel:', error);
        }
      }
    } catch (error) {
      console.error('DevBadge command error:', error);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('An error occurred while processing your request.');
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
