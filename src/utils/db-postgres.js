import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection pool using Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_R92zpKrqTHiS@ep-winter-firefly-a1aot6x0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        welcome_channel TEXT,
        goodbye_channel TEXT,
        logs_channel TEXT,
        prefix TEXT DEFAULT '!',
        auto_role TEXT,
        ticket_category TEXT,
        max_warnings INTEGER DEFAULT 3,
        dev_app_id TEXT,
        dev_news_channel TEXT,
        dev_badge_enabled INTEGER DEFAULT 0,
        dev_setup_date TEXT,
        welcome_message TEXT,
        goodbye_message TEXT,
        anti_spam_enabled INTEGER DEFAULT 0,
        anti_spam_cooldown INTEGER DEFAULT 5,
        leveling_enabled INTEGER DEFAULT 0,
        reputation_enabled INTEGER DEFAULT 1,
        suggestions_channel TEXT,
        giveaway_channel TEXT,
        auto_mod_enabled INTEGER DEFAULT 0,
        max_mentions_spam INTEGER DEFAULT 5,
        notification_role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS member_warnings (
        id SERIAL PRIMARY KEY,
        guild_id TEXT,
        user_id TEXT,
        warned_by TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS member_logs (
        id SERIAL PRIMARY KEY,
        guild_id TEXT,
        user_id TEXT,
        action TEXT,
        reason TEXT,
        moderator_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS user_statistics (
        id SERIAL PRIMARY KEY,
        guild_id TEXT,
        user_id TEXT,
        messages_sent INTEGER DEFAULT 0,
        commands_used INTEGER DEFAULT 0,
        last_message TIMESTAMP,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id),
        UNIQUE(guild_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        ticket_id TEXT UNIQUE,
        guild_id TEXT,
        creator_id TEXT,
        channel_id TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        guild_id TEXT,
        reminder_text TEXT,
        remind_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notified INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS dev_badge_tracking (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        command_name TEXT NOT NULL,
        last_used_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id, command_name)
      );

      CREATE TABLE IF NOT EXISTS user_reputation (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reputation_points INTEGER DEFAULT 0,
        total_upvotes INTEGER DEFAULT 0,
        total_downvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id),
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        suggestion_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        message_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS giveaways (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        prize TEXT NOT NULL,
        description TEXT,
        ends_at TIMESTAMP NOT NULL,
        winners_count INTEGER DEFAULT 1,
        message_id TEXT,
        channel_id TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS giveaway_entries (
        id SERIAL PRIMARY KEY,
        giveaway_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(giveaway_id, user_id),
        FOREIGN KEY (giveaway_id) REFERENCES giveaways(id)
      );

      CREATE TABLE IF NOT EXISTS leveling_system (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id),
        FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        guild_id TEXT,
        user_id TEXT,
        action TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_member_warnings_guild ON member_warnings(guild_id);
      CREATE INDEX IF NOT EXISTS idx_member_logs_guild ON member_logs(guild_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_guild ON activity_logs(guild_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Guild settings functions
const getGuildSettings = async (guildId) => {
  try {
    const result = await pool.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting guild settings:', error);
    return null;
  }
};

const setGuildSetting = async (guildId, settings) => {
  try {
    const existing = await getGuildSettings(guildId);

    if (!existing) {
      const keys = Object.keys(settings);
      const values = Object.values(settings);
      const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
      const columns = keys.join(', ');

      await pool.query(
        `INSERT INTO guild_settings (guild_id, ${columns}) VALUES ($1, ${placeholders})`,
        [guildId, ...values]
      );
    } else {
      const keys = Object.keys(settings);
      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const values = Object.values(settings);

      await pool.query(
        `UPDATE guild_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE guild_id = $1`,
        [guildId, ...values]
      );
    }
  } catch (error) {
    console.error('Error setting guild settings:', error);
    throw error;
  }
};

// Warning functions
const addWarning = async (guildId, userId, warnedBy, reason) => {
  try {
    await pool.query(
      'INSERT INTO member_warnings (guild_id, user_id, warned_by, reason) VALUES ($1, $2, $3, $4)',
      [guildId, userId, warnedBy, reason]
    );
  } catch (error) {
    console.error('Error adding warning:', error);
    throw error;
  }
};

const getWarnings = async (guildId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [guildId, userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting warnings:', error);
    return [];
  }
};

// Logging functions
const addLog = async (guildId, userId, action, reason, moderatorId) => {
  try {
    await pool.query(
      'INSERT INTO member_logs (guild_id, user_id, action, reason, moderator_id) VALUES ($1, $2, $3, $4, $5)',
      [guildId, userId, action, reason, moderatorId]
    );
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

const getLogs = async (guildId, limit = 10) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_logs WHERE guild_id = $1 ORDER BY created_at DESC LIMIT $2',
      [guildId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
};

const getActivityLogs = async (guildId, limit = 50) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activity_logs WHERE guild_id = $1 ORDER BY created_at DESC LIMIT $2',
      [guildId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return [];
  }
};

const logActivity = async (guildId, userId, action, details = '') => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (guild_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [guildId, userId, action, details]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Ticket functions
const createTicket = async (ticketId, guildId, creatorId, channelId) => {
  try {
    await pool.query(
      'INSERT INTO tickets (ticket_id, guild_id, creator_id, channel_id) VALUES ($1, $2, $3, $4)',
      [ticketId, guildId, creatorId, channelId]
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

const closeTicket = async (ticketId) => {
  try {
    await pool.query(
      'UPDATE tickets SET status = $1, closed_at = CURRENT_TIMESTAMP WHERE ticket_id = $2',
      ['closed', ticketId]
    );
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
};

const getOpenTickets = async (guildId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' ORDER BY created_at DESC",
      [guildId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting open tickets:', error);
    return [];
  }
};

// Reminder functions
const createReminder = async (userId, guildId, reminderText, remindAt) => {
  try {
    await pool.query(
      'INSERT INTO reminders (user_id, guild_id, reminder_text, remind_at) VALUES ($1, $2, $3, $4)',
      [userId, guildId, reminderText, remindAt]
    );
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

const getPendingReminders = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM reminders WHERE notified = 0 AND remind_at <= NOW()"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    return [];
  }
};

const markReminderNotified = async (id) => {
  try {
    await pool.query('UPDATE reminders SET notified = 1 WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error marking reminder notified:', error);
    throw error;
  }
};

// Reputation functions
const addReputation = async (guildId, userId, points) => {
  try {
    const existing = await pool.query(
      'SELECT * FROM user_reputation WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO user_reputation (guild_id, user_id, reputation_points) VALUES ($1, $2, $3)',
        [guildId, userId, points]
      );
    } else {
      const upvotes = points > 0 ? points : 0;
      const downvotes = points < 0 ? Math.abs(points) : 0;
      await pool.query(
        `UPDATE user_reputation 
         SET reputation_points = reputation_points + $1, 
             total_upvotes = total_upvotes + $2,
             total_downvotes = total_downvotes + $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE guild_id = $4 AND user_id = $5`,
        [points, upvotes, downvotes, guildId, userId]
      );
    }
  } catch (error) {
    console.error('Error adding reputation:', error);
    throw error;
  }
};

const getReputation = async (guildId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_reputation WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting reputation:', error);
    return null;
  }
};

const getLeaderboard = async (guildId, limit = 10) => {
  try {
    const result = await pool.query(
      'SELECT user_id, reputation_points, total_upvotes, total_downvotes, updated_at FROM user_reputation WHERE guild_id = $1 ORDER BY reputation_points DESC LIMIT $2',
      [guildId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Suggestion functions
const createSuggestion = async (guildId, userId, suggestionText) => {
  try {
    const result = await pool.query(
      'INSERT INTO suggestions (guild_id, user_id, suggestion_text) VALUES ($1, $2, $3) RETURNING id',
      [guildId, userId, suggestionText]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating suggestion:', error);
    throw error;
  }
};

const getSuggestions = async (guildId, status = 'pending', limit = 10) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE guild_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3',
      [guildId, status, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};

const updateSuggestionStatus = async (suggestionId, status) => {
  try {
    await pool.query(
      'UPDATE suggestions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, suggestionId]
    );
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
};

// Giveaway functions
const createGiveaway = async (guildId, creatorId, prize, description, endsAt, winnersCount, channelId) => {
  try {
    const result = await pool.query(
      'INSERT INTO giveaways (guild_id, creator_id, prize, description, ends_at, winners_count, channel_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [guildId, creatorId, prize, description, endsAt, winnersCount, channelId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating giveaway:', error);
    throw error;
  }
};

const getActiveGiveaways = async (guildId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM giveaways WHERE guild_id = $1 AND status = 'active' AND ends_at > NOW() ORDER BY ends_at ASC",
      [guildId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting active giveaways:', error);
    return [];
  }
};

const getGiveaway = async (giveawayId) => {
  try {
    const result = await pool.query('SELECT * FROM giveaways WHERE id = $1', [giveawayId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting giveaway:', error);
    return null;
  }
};

const addGiveawayEntry = async (giveawayId, userId) => {
  try {
    await pool.query(
      'INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES ($1, $2)',
      [giveawayId, userId]
    );
  } catch (error) {
    console.error('Error adding giveaway entry:', error);
    throw error;
  }
};

const getGiveawayEntries = async (giveawayId) => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM giveaway_entries WHERE giveaway_id = $1',
      [giveawayId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting giveaway entries:', error);
    return [];
  }
};

const completeGiveaway = async (giveawayId) => {
  try {
    await pool.query(
      "UPDATE giveaways SET status = 'completed', ends_at = CURRENT_TIMESTAMP WHERE id = $1",
      [giveawayId]
    );
  } catch (error) {
    console.error('Error completing giveaway:', error);
    throw error;
  }
};

// Leveling functions
const addExperience = async (guildId, userId, experience) => {
  try {
    const existing = await pool.query(
      'SELECT * FROM leveling_system WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO leveling_system (guild_id, user_id, experience) VALUES ($1, $2, $3)',
        [guildId, userId, experience]
      );
    } else {
      await pool.query(
        'UPDATE leveling_system SET experience = experience + $1, updated_at = CURRENT_TIMESTAMP WHERE guild_id = $2 AND user_id = $3',
        [experience, guildId, userId]
      );
    }
  } catch (error) {
    console.error('Error adding experience:', error);
    throw error;
  }
};

const getLevelData = async (guildId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leveling_system WHERE guild_id = $1 AND user_id = $2',
      [guildId, userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting level data:', error);
    return null;
  }
};

const getLevelingLeaderboard = async (guildId, limit = 10) => {
  try {
    const result = await pool.query(
      'SELECT user_id, level, experience, updated_at FROM leveling_system WHERE guild_id = $1 ORDER BY level DESC, experience DESC LIMIT $2',
      [guildId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting leveling leaderboard:', error);
    return [];
  }
};

// Admin user functions
const createAdminUser = async (username, passwordHash) => {
  try {
    const result = await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

const getAdminUser = async (username) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
};

const updateAdminLastLogin = async (userId) => {
  try {
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

const getBotStats = async () => {
  try {
    const guildCount = await pool.query('SELECT COUNT(DISTINCT guild_id) as count FROM guild_settings');
    const userCount = await pool.query('SELECT COUNT(DISTINCT user_id) as count FROM user_statistics');
    const recentLogs = await pool.query('SELECT COUNT(*) as count FROM activity_logs WHERE created_at > NOW() - INTERVAL \'24 hours\'');

    return {
      guilds: parseInt(guildCount.rows[0]?.count) || 0,
      users: parseInt(userCount.rows[0]?.count) || 0,
      recentActivity: parseInt(recentLogs.rows[0]?.count) || 0,
    };
  } catch (error) {
    console.error('Error getting bot stats:', error);
    return { guilds: 0, users: 0, recentActivity: 0 };
  }
};

export {
  pool,
  initializeDatabase,
  getGuildSettings,
  setGuildSetting,
  addWarning,
  getWarnings,
  addLog,
  getLogs,
  getActivityLogs,
  logActivity,
  createTicket,
  closeTicket,
  getOpenTickets,
  createReminder,
  getPendingReminders,
  markReminderNotified,
  addReputation,
  getReputation,
  getLeaderboard,
  createSuggestion,
  getSuggestions,
  updateSuggestionStatus,
  createGiveaway,
  getActiveGiveaways,
  getGiveaway,
  addGiveawayEntry,
  getGiveawayEntries,
  completeGiveaway,
  addExperience,
  getLevelData,
  getLevelingLeaderboard,
  createAdminUser,
  getAdminUser,
  updateAdminLastLogin,
  getBotStats,
};
