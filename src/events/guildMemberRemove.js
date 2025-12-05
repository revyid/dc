import { getGuildSettings, loadGuildSettings } from '../utils/database.js';

// Track recent member leaves to prevent duplicate messages
const recentLeaves = new Map();
const DEBOUNCE_TIME = 5000; // 5 seconds

export default {
  name: 'guildMemberRemove',
  async execute(client, member) {
    // Debounce: prevent duplicate triggers
    const key = `${member.guild.id}-${member.user.id}`;
    if (recentLeaves.has(key)) {
      console.log(`⏭️ Skipping duplicate goodbye for ${member.user.tag}`);
      return;
    }
    recentLeaves.set(key, Date.now());
    setTimeout(() => recentLeaves.delete(key), DEBOUNCE_TIME);

    try {
      // Load fresh settings
      await loadGuildSettings(member.guild.id);
      const settings = getGuildSettings(member.guild.id);
      const channelId = settings?.goodbye_channel;

      const goodbyeChannel = channelId
        ? member.guild.channels.cache.get(channelId)
        : member.guild.channels.cache.find(ch => ch.name === 'goodbye' && ch.isTextBased());

      if (!goodbyeChannel) {
        console.log(`⚠️ Goodbye channel not found in ${member.guild.name}`);
        return;
      }

      // Use custom message if set, otherwise use default
      let goodbyeText = settings?.goodbye_message
        ? settings.goodbye_message
          .replace('{user}', member.user.toString())
          .replace('{guild}', member.guild.name)
          .replace('{memberSince}', new Date(member.joinedTimestamp).toLocaleDateString('id-ID'))
        : `${member.user.username} has left the server.`;

      await goodbyeChannel.send({
        embeds: [{
          color: 0xe74c3c,
          title: '👋 Goodbye!',
          description: goodbyeText,
          fields: [
            {
              name: 'Member Since',
              value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
              inline: false,
            },
            {
              name: 'Time in Server',
              value: `${Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24))} days`,
              inline: false,
            },
          ],
          thumbnail: { url: member.user.displayAvatarURL() },
          footer: { text: 'We hope to see you again!' },
        }],
      });

      console.log(`✅ Goodbye message sent for ${member.user.tag} in ${member.guild.name}`);
    } catch (error) {
      console.error(`Failed to send goodbye message in ${member.guild.name}:`, error);
    }
  },
};

