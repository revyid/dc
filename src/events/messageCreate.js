import { trackMessage } from '../utils/statistics.js';

export default {
  name: 'messageCreate',
  execute(client, message) {
    if (message.author.bot) return;
    if (!message.guildId) return;

    try {
      // Track message statistics
      trackMessage(message.guildId, message.author.id);
    } catch (error) {
      console.error('Error tracking message:', error);
    }
  },
};
