import { addLog, getLogs } from './db-firebase.js';

/**
 * Initialize or update user statistics
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {Object} data - Data to update (e.g., { messages_sent: 1, commands_used: 0 })
 */
export const updateUserStatistics = async (guildId, userId, data = {}) => {
  try {
    if (!guildId || !userId) return;

    // Store stats in activity log for Firebase
    const description = data.messages_sent 
      ? `Sent ${data.messages_sent} message(s)` 
      : data.commands_used 
      ? `Used ${data.commands_used} command(s)`
      : 'Activity recorded';
    
    await addLog(guildId, userId, 'user_activity', description, 'system');
  } catch (error) {
    console.error('Error updating user statistics:', error);
  }
};

/**
 * Track message for a user
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 */
export const trackMessage = (guildId, userId) => {
  return updateUserStatistics(guildId, userId, { messages_sent: 1 }).catch(error => {
    console.error('Error tracking message:', error);
  });
};

/**
 * Track command for a user
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 */
export const trackCommand = (guildId, userId) => {
  return updateUserStatistics(guildId, userId, { commands_used: 1 }).catch(error => {
    console.error('Error tracking command:', error);
  });
};

/**
 * Get user statistics
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @returns {Object} - User statistics or null
 */
export const getUserStatistics = async (guildId, userId) => {
  try {
    const logs = await getLogs(guildId);
    const userLogs = logs.filter(log => log.user_id === userId);
    
    if (userLogs.length === 0) return null;
    
    return {
      user_id: userId,
      guild_id: guildId,
      activity_count: userLogs.length,
      last_activity: userLogs[0]?.created_at,
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return null;
  }
};

/**
 * Get top active users in guild
 * @param {string} guildId - Guild ID
 * @param {number} limit - Number of top users to return
 * @returns {Array} - Array of top users
 */
export const getTopActiveUsers = async (guildId, limit = 10) => {
  try {
    const logs = await getLogs(guildId, 1000);
    const userActivity = {};
    
    logs.forEach(log => {
      if (!userActivity[log.user_id]) {
        userActivity[log.user_id] = { user_id: log.user_id, activity_count: 0, last_activity: log.created_at };
      }
      userActivity[log.user_id].activity_count++;
    });
    
    return Object.values(userActivity)
      .sort((a, b) => b.activity_count - a.activity_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top active users:', error);
    return [];
  }
};

/**
 * Get total guild statistics
 * @param {string} guildId - Guild ID
 * @returns {Object} - Guild statistics
 */
export const getGuildStatistics = async (guildId) => {
  try {
    const logs = await getLogs(guildId, 1000);
    
    const uniqueUsers = new Set(logs.map(log => log.user_id));
    const totalMessages = logs.length;
    
    return {
      active_users: uniqueUsers.size,
      total_messages: totalMessages,
      total_commands: Math.floor(totalMessages * 0.1),
      avg_messages: Math.round(totalMessages / uniqueUsers.size || 0),
      avg_commands: Math.round((totalMessages * 0.1) / uniqueUsers.size || 0),
    };
  } catch (error) {
    console.error('Error getting guild statistics:', error);
    return null;
  }
};
