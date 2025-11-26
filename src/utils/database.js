import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/bot.db');

const db = new Database(dbPath, { verbose: null });

db.exec('PRAGMA journal_mode = WAL');

// Migration function to add new columns if they don't exist
const migrateDatabase = () => {
  try {
    const checkColumns = db.prepare(`PRAGMA table_info(guild_settings)`).all();
    const columnNames = checkColumns.map(col => col.name);
    
    const newColumns = [
      { name: 'dev_app_id', type: 'TEXT', default: '' },
      { name: 'dev_news_channel', type: 'TEXT', default: '' },
      { name: 'dev_badge_enabled', type: 'INTEGER DEFAULT 0', default: 0 },
      { name: 'dev_setup_date', type: 'TEXT', default: '' },
      { name: 'welcome_message', type: 'TEXT', default: '' },
      { name: 'goodbye_message', type: 'TEXT', default: '' },
      { name: 'anti_spam_enabled', type: 'INTEGER DEFAULT 0', default: 0 },
      { name: 'anti_spam_cooldown', type: 'INTEGER DEFAULT 5', default: 5 },
      { name: 'leveling_enabled', type: 'INTEGER DEFAULT 0', default: 0 },
      { name: 'reputation_enabled', type: 'INTEGER DEFAULT 1', default: 1 },
      { name: 'suggestions_channel', type: 'TEXT', default: '' },
      { name: 'giveaway_channel', type: 'TEXT', default: '' },
      { name: 'auto_mod_enabled', type: 'INTEGER DEFAULT 0', default: 0 },
      { name: 'max_mentions_spam', type: 'INTEGER DEFAULT 5', default: 5 },
      { name: 'notification_role', type: 'TEXT', default: '' },
    ];

    for (const col of newColumns) {
      if (!columnNames.includes(col.name)) {
        db.exec(`ALTER TABLE guild_settings ADD COLUMN ${col.name} ${col.type};`);
        console.log(`✓ Added ${col.name} column to guild_settings`);
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

db.exec(`
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS member_warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    warned_by TEXT,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS member_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    action TEXT,
    reason TEXT,
    moderator_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS user_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    messages_sent INTEGER DEFAULT 0,
    commands_used INTEGER DEFAULT 0,
    last_message DATETIME,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id),
    UNIQUE(guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE,
    guild_id TEXT,
    creator_id TEXT,
    channel_id TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    guild_id TEXT,
    reminder_text TEXT,
    remind_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notified INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS dev_badge_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    last_used_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, user_id, command_name)
  );

  CREATE TABLE IF NOT EXISTS user_reputation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reputation_points INTEGER DEFAULT 0,
    total_upvotes INTEGER DEFAULT 0,
    total_downvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    suggestion_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    message_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    description TEXT,
    ends_at DATETIME NOT NULL,
    winners_count INTEGER DEFAULT 1,
    message_id TEXT,
    channel_id TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );

  CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(giveaway_id, user_id),
    FOREIGN KEY (giveaway_id) REFERENCES giveaways(id)
  );

  CREATE TABLE IF NOT EXISTS leveling_system (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
  );
`);

// Run migrations
migrateDatabase();

const getGuildSettings = (guildId) => {
  const stmt = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?');
  return stmt.get(guildId) || null;
};

const setGuildSetting = (guildId, settings) => {
  const existing = getGuildSettings(guildId);
  
  if (!existing) {
    const keys = Object.keys(settings);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`
      INSERT INTO guild_settings (guild_id, ${keys.join(', ')})
      VALUES (?, ${placeholders})
    `);
    const values = Object.values(settings).map(v => {
      // Convert boolean to integer for SQLite
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v;
    });
    stmt.run(guildId, ...values);
  } else {
    const keys = Object.keys(settings);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const stmt = db.prepare(`
      UPDATE guild_settings 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE guild_id = ?
    `);
    const values = Object.values(settings).map(v => {
      // Convert boolean to integer for SQLite
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v;
    });
    stmt.run(...values, guildId);
  }
};

const addWarning = (guildId, userId, warnedBy, reason) => {
  const stmt = db.prepare(`
    INSERT INTO member_warnings (guild_id, user_id, warned_by, reason)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(guildId, userId, warnedBy, reason);
};

const getWarnings = (guildId, userId) => {
  const stmt = db.prepare(`
    SELECT * FROM member_warnings 
    WHERE guild_id = ? AND user_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(guildId, userId);
};

const addLog = (guildId, userId, action, reason, moderatorId) => {
  const stmt = db.prepare(`
    INSERT INTO member_logs (guild_id, user_id, action, reason, moderator_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(guildId, userId, action, reason, moderatorId);
};

const getLogs = (guildId, limit = 10) => {
  const stmt = db.prepare(`
    SELECT * FROM member_logs 
    WHERE guild_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(guildId, limit);
};

const createTicket = (ticketId, guildId, creatorId, channelId) => {
  const stmt = db.prepare(`
    INSERT INTO tickets (ticket_id, guild_id, creator_id, channel_id)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(ticketId, guildId, creatorId, channelId);
};

const closeTicket = (ticketId) => {
  const stmt = db.prepare(`
    UPDATE tickets 
    SET status = 'closed', closed_at = CURRENT_TIMESTAMP
    WHERE ticket_id = ?
  `);
  return stmt.run(ticketId);
};

const getOpenTickets = (guildId) => {
  const stmt = db.prepare(`
    SELECT * FROM tickets 
    WHERE guild_id = ? AND status = 'open'
    ORDER BY created_at DESC
  `);
  return stmt.all(guildId);
};

const createReminder = (userId, guildId, reminderText, remindAt) => {
  const stmt = db.prepare(`
    INSERT INTO reminders (user_id, guild_id, reminder_text, remind_at)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(userId, guildId, reminderText, remindAt);
};

const getPendingReminders = () => {
  const stmt = db.prepare(`
    SELECT * FROM reminders 
    WHERE notified = 0 AND remind_at <= datetime('now')
  `);
  return stmt.all();
};

const markReminderNotified = (id) => {
  const stmt = db.prepare('UPDATE reminders SET notified = 1 WHERE id = ?');
  return stmt.run(id);
};

// Reputation functions
const addReputation = (guildId, userId, points) => {
  const existing = db.prepare('SELECT * FROM user_reputation WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  
  if (!existing) {
    const stmt = db.prepare(`
      INSERT INTO user_reputation (guild_id, user_id, reputation_points)
      VALUES (?, ?, ?)
    `);
    return stmt.run(guildId, userId, points);
  } else {
    const upvotes = points > 0 ? points : 0;
    const downvotes = points < 0 ? Math.abs(points) : 0;
    const stmt = db.prepare(`
      UPDATE user_reputation 
      SET reputation_points = reputation_points + ?, 
          total_upvotes = total_upvotes + ?,
          total_downvotes = total_downvotes + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE guild_id = ? AND user_id = ?
    `);
    return stmt.run(points, upvotes, downvotes, guildId, userId);
  }
};

const getReputation = (guildId, userId) => {
  const stmt = db.prepare('SELECT * FROM user_reputation WHERE guild_id = ? AND user_id = ?');
  return stmt.get(guildId, userId) || null;
};

const getLeaderboard = (guildId, limit = 10) => {
  const stmt = db.prepare(`
    SELECT user_id, reputation_points, total_upvotes, total_downvotes, updated_at
    FROM user_reputation
    WHERE guild_id = ?
    ORDER BY reputation_points DESC
    LIMIT ?
  `);
  return stmt.all(guildId, limit);
};

// Suggestion functions
const createSuggestion = (guildId, userId, suggestionText) => {
  const stmt = db.prepare(`
    INSERT INTO suggestions (guild_id, user_id, suggestion_text)
    VALUES (?, ?, ?)
  `);
  return stmt.run(guildId, userId, suggestionText);
};

const getSuggestions = (guildId, status = 'pending', limit = 10) => {
  const stmt = db.prepare(`
    SELECT * FROM suggestions
    WHERE guild_id = ? AND status = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(guildId, status, limit);
};

const updateSuggestionStatus = (suggestionId, status) => {
  const stmt = db.prepare(`
    UPDATE suggestions 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(status, suggestionId);
};

// Giveaway functions
const createGiveaway = (guildId, creatorId, prize, description, endsAt, winnersCount, channelId) => {
  const stmt = db.prepare(`
    INSERT INTO giveaways (guild_id, creator_id, prize, description, ends_at, winners_count, channel_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(guildId, creatorId, prize, description, endsAt, winnersCount, channelId);
};

const getActiveGiveaways = (guildId) => {
  const stmt = db.prepare(`
    SELECT * FROM giveaways
    WHERE guild_id = ? AND status = 'active' AND ends_at > datetime('now')
    ORDER BY ends_at ASC
  `);
  return stmt.all(guildId);
};

const getGiveaway = (giveawayId) => {
  const stmt = db.prepare('SELECT * FROM giveaways WHERE id = ?');
  return stmt.get(giveawayId);
};

const addGiveawayEntry = (giveawayId, userId) => {
  const stmt = db.prepare(`
    INSERT INTO giveaway_entries (giveaway_id, user_id)
    VALUES (?, ?)
  `);
  return stmt.run(giveawayId, userId);
};

const getGiveawayEntries = (giveawayId) => {
  const stmt = db.prepare(`
    SELECT user_id FROM giveaway_entries
    WHERE giveaway_id = ?
  `);
  return stmt.all(giveawayId);
};

const completeGiveaway = (giveawayId) => {
  const stmt = db.prepare(`
    UPDATE giveaways 
    SET status = 'completed', ends_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(giveawayId);
};

// Leveling functions
const addExperience = (guildId, userId, experience) => {
  const existing = db.prepare('SELECT * FROM leveling_system WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  
  if (!existing) {
    const stmt = db.prepare(`
      INSERT INTO leveling_system (guild_id, user_id, experience)
      VALUES (?, ?, ?)
    `);
    return stmt.run(guildId, userId, experience);
  } else {
    const stmt = db.prepare(`
      UPDATE leveling_system 
      SET experience = experience + ?, updated_at = CURRENT_TIMESTAMP
      WHERE guild_id = ? AND user_id = ?
    `);
    return stmt.run(experience, guildId, userId);
  }
};

const getLevelData = (guildId, userId) => {
  const stmt = db.prepare('SELECT * FROM leveling_system WHERE guild_id = ? AND user_id = ?');
  return stmt.get(guildId, userId) || null;
};

const getLevelingLeaderboard = (guildId, limit = 10) => {
  const stmt = db.prepare(`
    SELECT user_id, level, experience, updated_at
    FROM leveling_system
    WHERE guild_id = ?
    ORDER BY level DESC, experience DESC
    LIMIT ?
  `);
  return stmt.all(guildId, limit);
};

export {
  db,
  getGuildSettings,
  setGuildSetting,
  addWarning,
  getWarnings,
  addLog,
  getLogs,
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
};
