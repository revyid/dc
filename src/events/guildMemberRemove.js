import { getGuildSettings } from '../utils/database.js';

export default {
  name: 'guildMemberRemove',
  execute(client, member) {
    try {
      const settings = getGuildSettings(member.guild.id);
      const channelId = settings?.goodbye_channel;
      
      const goodbyeChannel = channelId 
        ? member.guild.channels.cache.get(channelId)
        : member.guild.channels.cache.find(ch => ch.name === 'goodbye' && ch.isTextBased());

      if (!goodbyeChannel) {
        console.log(`⚠️ Goodbye channel not found in ${member.guild.name}`);
        return;
      }

      goodbyeChannel.send({
        embeds: [{
          color: 0xe74c3c,
          title: '👋 Goodbye!',
          description: `${member.user.username} has left the server.`,
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
    } catch (error) {
      console.error(`Failed to send goodbye message in ${member.guild.name}:`, error);
    }
  },
};
