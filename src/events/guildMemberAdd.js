import { getGuildSettings, logActivity } from '../utils/database.js';

export default {
  name: 'guildMemberAdd',
  async execute(client, member) {
    try {
      const settings = getGuildSettings(member.guild.id);
      const channelId = settings?.welcome_channel;
      
      const welcomeChannel = channelId 
        ? member.guild.channels.cache.get(channelId)
        : member.guild.channels.cache.find(ch => ch.name === 'welcome' && ch.isTextBased());

      if (!welcomeChannel) {
        console.log(`⚠️ Welcome channel not found in ${member.guild.name}`);
        return;
      }

      welcomeChannel.send({
        embeds: [{
          color: 0x2ecc71,
          title: '🎉 Welcome!',
          description: `Welcome to **${member.guild.name}**, ${member.user}!`,
          fields: [
            {
              name: 'Member Count',
              value: `You are member #${member.guild.memberCount}`,
              inline: false,
            },
            {
              name: 'Account Created',
              value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
              inline: false,
            },
          ],
          thumbnail: { url: member.user.displayAvatarURL() },
          footer: { text: 'Welcome to our server!' },
        }],
      });

      // Log activity asynchronously without blocking
      await logActivity(member.guild.id, member.user.id, 'member_join', `${member.user.tag} joined the server`).catch(error => {
        console.error('Failed to log member join:', error);
      });
    } catch (error) {
      console.error(`Failed to send welcome message in ${member.guild.name}:`, error);
    }
  },
};
