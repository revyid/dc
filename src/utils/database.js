// Compatibility layer - maps old SQLite calls to Firebase Realtime Database
// This allows existing code to work without massive refactoring
import {
  getGuildSettings,
  loadGuildSettings,
  setGuildSetting,
  getGuildRoles,
  loadGuildRoles,
  setGuildRole,
  initializeGuildRoles,
  addWarning,
  getWarnings,
  addLog,
  getLogs,
  getActivityLogs,
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
  logActivity,
  initializeDatabase,
  database,
  // Rules functions
  saveGuildRules,
  getGuildRules,
  setRulesChannel,
  setVerifiedRole,
  logRulesAgreement,
  // Poll functions
  createPoll,
  votePoll,
  getPoll,
  getActivePolls,
  endPoll,
  updatePollMessage,
  // Invite functions
  saveInviteLink,
  getInviteByShortCode,
  getGuildInvites,
  incrementInviteUses,
  deleteInviteLink,
  getAllShortLinks,
} from './db-firebase.js';

// Mock db object for backward compatibility with code that uses db.prepare()
const db = {
  prepare: (sql) => ({
    run: (...params) => {
      console.warn('⚠️ Using old SQLite-style db.prepare() - please migrate to async functions');
      return null;
    },
    get: (...params) => {
      console.warn('⚠️ Using old SQLite-style db.prepare() - please migrate to async functions');
      return null;
    },
    all: (...params) => {
      console.warn('⚠️ Using old SQLite-style db.prepare() - please migrate to async functions');
      return [];
    },
  }),
  exec: () => { },
};

export {
  db,
  database,
  initializeDatabase,
  getGuildSettings,
  loadGuildSettings,
  setGuildSetting,
  getGuildRoles,
  loadGuildRoles,
  setGuildRole,
  initializeGuildRoles,
  addWarning,
  getWarnings,
  addLog,
  getLogs,
  getActivityLogs,
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
  logActivity,
  // Rules functions
  saveGuildRules,
  getGuildRules,
  setRulesChannel,
  setVerifiedRole,
  logRulesAgreement,
  // Poll functions
  createPoll,
  votePoll,
  getPoll,
  getActivePolls,
  endPoll,
  updatePollMessage,
  // Invite functions
  saveInviteLink,
  getInviteByShortCode,
  getGuildInvites,
  incrementInviteUses,
  deleteInviteLink,
  getAllShortLinks,
};
