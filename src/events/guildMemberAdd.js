import { getGuildSettings, loadGuildSettings, logActivity } from '../utils/database.js';

// Track recent member joins to prevent duplicate messages
const recentJoins = new Map();
const DEBOUNCE_TIME = 5000; // 5 seconds

export default {
  name: 'guildMemberAdd',
  async execute(client, member) {
    // Debounce: prevent duplicate triggers
    const key = `${member.guild.id}-${member.user.id}`;
    if (recentJoins.has(key)) {
      console.log(`⏭️ Skipping duplicate welcome for ${member.user.tag}`);
      return;
    }
    recentJoins.set(key, Date.now());
    setTimeout(() => recentJoins.delete(key), DEBOUNCE_TIME);

    try {
      // Load fresh settings
      await loadGuildSettings(member.guild.id);
      const settings = getGuildSettings(member.guild.id);
      const channelId = settings?.welcome_channel;

      const welcomeChannel = channelId
        ? member.guild.channels.cache.get(channelId)
        : member.guild.channels.cache.find(ch => ch.name === 'welcome' && ch.isTextBased());

      if (!welcomeChannel) {
        console.log(`⚠️ Welcome channel not found in ${member.guild.name}`);
        return;
      }

      // Use custom message if set, otherwise use default
      let welcomeText = settings?.welcome_message
        ? settings.welcome_message
          .replace('{user}', member.user.toString())
          .replace('{guild}', member.guild.name)
          .replace('{count}', member.guild.memberCount)
        : `Welcome to **${member.guild.name}**, ${member.user}!\n\nYou are member #${member.guild.memberCount}`;

      await welcomeChannel.send({
        embeds: [{
          color: 0x2ecc71,
          title: '🎉 Welcome!',
          description: welcomeText,
          fields: [
            {
              name: 'Account Created',
              value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
              inline: false,
            },
          ],
          thumbnail: { url: member.user.displayAvatarURL() },
          footer: { text: 'Welcome to our community!' },
        }],
      });

      console.log(`✅ Welcome message sent for ${member.user.tag} in ${member.guild.name}`);

      // Log activity asynchronously without blocking
      await logActivity(member.guild.id, member.user.id, 'member_join', `${member.user.tag} joined the server`).catch(error => {
        console.error('Failed to log member join:', error);
      });
    } catch (error) {
      console.error(`Failed to send welcome message in ${member.guild.name}:`, error);
    }
  },
};

