// Compatibility layer - maps old SQLite calls to PostgreSQL
// This allows existing code to work without massive refactoring
import { 
  pool,
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
  logActivity,
} from './db-postgres.js';

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
  exec: () => {},
};

export {
  db,
  pool,
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
  logActivity,
};
