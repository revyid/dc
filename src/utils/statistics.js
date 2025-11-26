import { pool } from './database.js';

/**
 * Initialize or update user statistics
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {Object} data - Data to update (e.g., { messages_sent: 1, commands_used: 0 })
 */
export const updateUserStatistics = async (guildId, userId, data = {}) => {
  try {
    if (!guildId || !userId) return;

    // Ensure guild exists in guild_settings first
    const guildExists = await pool.query(
      'SELECT 1 FROM guild_settings WHERE guild_id = $1',
      [guildId]
    );

    if (guildExists.rows.length === 0) {
      // Create default guild settings if it doesn't exist
      await pool.query(
        'INSERT INTO guild_settings (guild_id, prefix) VALUES ($1, $2) ON CONFLICT(guild_id) DO NOTHING',
        [guildId, '!']
      );
    }

    // Check if user exists
    const existing = await pool.query(
      'SELECT id FROM user_statistics WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );

    if (existing.rows.length === 0) {
      // Create new entry
      const messagesSent = data.messages_sent || 0;
      const commandsUsed = data.commands_used || 0;
      await pool.query(
        'INSERT INTO user_statistics (guild_id, user_id, messages_sent, commands_used, joined_at) VALUES ($1, $2, $3, $4, NOW())',
        [guildId, userId, messagesSent, commandsUsed]
      );
    } else {
      // Update existing entry
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const setClause = keys.map((k, i) => `${k} = ${k} + $${i + 1}`).join(', ');
        const values = Object.values(data);
        await pool.query(
          `UPDATE user_statistics SET ${setClause}, last_message = NOW() WHERE guild_id = $${keys.length + 1} AND user_id = $${keys.length + 2}`,
          [...values, guildId, userId]
        );
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
  updateUserStatistics(guildId, userId, { messages_sent: 1 }).catch(error => {
    console.error('Error tracking message:', error);
  });
};

/**
 * Track command for a user
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 */
export const trackCommand = (guildId, userId) => {
  updateUserStatistics(guildId, userId, { commands_used: 1 }).catch(error => {
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
    const result = await pool.query(
      'SELECT * FROM user_statistics WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );
    return result.rows[0] || null;
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
    const result = await pool.query(
      'SELECT user_id, messages_sent, commands_used, last_message FROM user_statistics WHERE guild_id = $1 ORDER BY messages_sent DESC LIMIT $2',
      [guildId, limit]
    );
    return result.rows || [];
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
    const result = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as active_users, SUM(messages_sent) as total_messages, SUM(commands_used) as total_commands, AVG(messages_sent) as avg_messages, AVG(commands_used) as avg_commands FROM user_statistics WHERE guild_id = $1',
      [guildId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting guild statistics:', error);
    return null;
  }
};
