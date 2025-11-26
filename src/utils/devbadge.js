import { db } from './database.js';

/**
 * Track command usage for Active Developer Badge eligibility
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} commandName - Command name
 */
export const trackCommandUsage = (guildId, userId, commandName) => {
  try {
    // Only track if guildId exists (not DM commands)
    if (!guildId || !userId || !commandName) {
      return;
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO dev_badge_tracking 
      (guild_id, user_id, command_name, last_used_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(guildId, userId, commandName, new Date().toISOString());
  } catch (error) {
    console.error('Error tracking command usage:', error);
  }
};

/**
 * Check if guild has active commands in last 30 days
 * @param {string} guildId - Guild ID
 * @returns {boolean} - True if active in last 30 days
 */
export const isGuildActive = (guildId) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM dev_badge_tracking
      WHERE guild_id = ? AND last_used_at >= ?
    `);
    
    const result = stmt.get(guildId, thirtyDaysAgo);
    return result.count > 0;
  } catch (error) {
    console.error('Error checking guild activity:', error);
    return false;
  }
};

/**
 * Get command usage statistics for a guild
 * @param {string} guildId - Guild ID
 * @returns {Array} - Array of command usage stats
 */
export const getCommandStats = (guildId) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        command_name,
        COUNT(*) as usage_count,
        MAX(last_used_at) as last_used
      FROM dev_badge_tracking
      WHERE guild_id = ?
      GROUP BY command_name
      ORDER BY usage_count DESC
      LIMIT 10
    `);
    
    return stmt.all(guildId) || [];
  } catch (error) {
    console.error('Error getting command stats:', error);
    return [];
  }
};

/**
 * Get badge eligibility report
 * @param {string} guildId - Guild ID
 * @param {Object} guildSettings - Guild settings from database
 * @returns {Object} - Eligibility report
 */
export const getBadgeEligibilityReport = (guildId, guildSettings) => {
  try {
    const isActive = isGuildActive(guildId);
    const appId = guildSettings?.dev_app_id;
    const devNewsChannel = guildSettings?.dev_news_channel;
    const setupDate = guildSettings?.dev_setup_date;
    
    const report = {
      guild_id: guildId,
      app_id_configured: !!appId,
      dev_news_channel_set: !!devNewsChannel,
      is_active: isActive,
      eligible: !!appId && !!devNewsChannel && isActive,
      setup_date: setupDate,
      last_check: new Date().toISOString(),
      message: '',
    };

    // Generate eligibility message
    const checks = [];
    checks.push(appId ? '✅' : '❌' + ' App ID configured');
    checks.push(devNewsChannel ? '✅' : '❌' + ' Dev news channel set');
    checks.push(isActive ? '✅' : '❌' + ' Commands used in last 30 days');

    report.message = checks.join('\n');
    
    if (!report.eligible) {
      if (!appId) report.message += '\n\n⚠️ Setup app ID with /devbadge setup';
      if (!devNewsChannel) report.message += '\n⚠️ Setup dev news channel with /devbadge setup';
      if (!isActive) report.message += '\n⚠️ Use an application command to activate';
    } else {
      report.message = '✅ Your app is eligible for the Active Developer Badge!\nVisit the Developer Portal to claim it.';
    }

    return report;
  } catch (error) {
    console.error('Error generating eligibility report:', error);
    return null;
  }
};

/**
 * Initialize dev badge tracking table
 */
export const initDevBadgeTable = () => {
  try {
    const stmt = db.prepare(`
      CREATE TABLE IF NOT EXISTS dev_badge_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        command_name TEXT NOT NULL,
        last_used_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id, command_name)
      )
    `);
    stmt.run();
    console.log('✓ Dev badge tracking table initialized');
  } catch (error) {
    console.error('Error initializing dev badge table:', error);
  }
};
