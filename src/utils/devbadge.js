import { getActivityLogs } from './database.js';

/**
 * Track command usage for Active Developer Badge eligibility
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} commandName - Command name
 */
export const trackCommandUsage = async (guildId, userId, commandName) => {
  try {
    // Command tracking is now handled by the activity log system
    if (!guildId || !userId || !commandName) {
      return;
    }
    // Activity logs are automatically tracked via logActivity()
  } catch (error) {
    console.error('Error tracking command usage:', error);
  }
};

/**
 * Check if guild has active commands in last 30 days
 * @param {string} guildId - Guild ID
 * @returns {boolean} - True if active in last 30 days
 */
export const isGuildActive = async (guildId) => {
  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const logs = await getActivityLogs(guildId, 1000) || [];
    
    return logs.some(log => new Date(log.created_at).getTime() >= thirtyDaysAgo);
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
export const getCommandStats = async (guildId) => {
  try {
    const logs = await getActivityLogs(guildId, 5000) || [];
    const commandStats = {};
    
    logs.forEach(log => {
      if (!commandStats[log.action]) {
        commandStats[log.action] = { count: 0, lastUsed: log.created_at };
      }
      commandStats[log.action].count++;
      commandStats[log.action].lastUsed = log.created_at;
    });
    
    return Object.entries(commandStats)
      .map(([command, stats]) => ({
        command_name: command,
        usage_count: stats.count,
        last_used: stats.lastUsed
      }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);
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
export const getBadgeEligibilityReport = async (guildId, guildSettings) => {
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
