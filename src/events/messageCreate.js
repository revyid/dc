import { trackMessage } from '../utils/statistics.js';

export default {
  name: 'messageCreate',
  execute(client, message) {
    if (message.author.bot) return;
    if (!message.guildId) return;

    try {
      // Track message statistics (async, don't await to not block)
      trackMessage(message.guildId, message.author.id).catch(error => {
        console.error('Error tracking message:', error);
      });
    } catch (error) {
      console.error('Error in messageCreate handler:', error);
    }
  },
};
