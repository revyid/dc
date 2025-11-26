import { db } from './database.js';

/**
 * Initialize or update user statistics
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {Object} data - Data to update (e.g., { messages_sent: 1, commands_used: 0 })
 */
export const updateUserStatistics = (guildId, userId, data = {}) => {
  try {
    if (!guildId || !userId) return;

    // Check if user exists
    const checkStmt = db.prepare(`
      SELECT id FROM user_statistics 
      WHERE guild_id = ? AND user_id = ?
    `);
    const existing = checkStmt.get(guildId, userId);

    if (!existing) {
      // Create new entry
      const insertStmt = db.prepare(`
        INSERT INTO user_statistics (guild_id, user_id, messages_sent, commands_used, joined_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      const messagesSent = data.messages_sent || 0;
      const commandsUsed = data.commands_used || 0;
      insertStmt.run(guildId, userId, messagesSent, commandsUsed);
    } else {
      // Update existing entry
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ${k} + ?`).join(', ');
        const updateStmt = db.prepare(`
          UPDATE user_statistics 
          SET ${setClause}, last_message = CURRENT_TIMESTAMP
          WHERE guild_id = ? AND user_id = ?
        `);
        const values = Object.values(data);
        updateStmt.run(...values, guildId, userId);
      }
    }
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
  updateUserStatistics(guildId, userId, { messages_sent: 1 });
};

/**
 * Track command for a user
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 */
export const trackCommand = (guildId, userId) => {
  updateUserStatistics(guildId, userId, { commands_used: 1 });
};

/**
 * Get user statistics
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @returns {Object} - User statistics or null
 */
export const getUserStatistics = (guildId, userId) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM user_statistics 
      WHERE guild_id = ? AND user_id = ?
    `);
    return stmt.get(guildId, userId) || null;
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
export const getTopActiveUsers = (guildId, limit = 10) => {
  try {
    const stmt = db.prepare(`
      SELECT user_id, messages_sent, commands_used, last_message
      FROM user_statistics
      WHERE guild_id = ?
      ORDER BY messages_sent DESC
      LIMIT ?
    `);
    return stmt.all(guildId, limit) || [];
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
export const getGuildStatistics = (guildId) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        SUM(messages_sent) as total_messages,
        SUM(commands_used) as total_commands,
        AVG(messages_sent) as avg_messages,
        AVG(commands_used) as avg_commands
      FROM user_statistics
      WHERE guild_id = ?
    `);
    return stmt.get(guildId) || null;
  } catch (error) {
    console.error('Error getting guild statistics:', error);
    return null;
  }
};
