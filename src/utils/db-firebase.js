import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, push, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_RTDB_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const settingsCache = new Map();

export const initializeDatabase = async () => {
    try {
        const rootRef = ref(database, '/');
        const snapshot = await get(rootRef);
        if (!snapshot.exists()) {
            await set(rootRef, {
                initialized: true,
                createdAt: new Date().toISOString(),
            });
        }
        console.log('✓ Firebase database initialized');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase database:', error);
        throw error;
    }
};

export const getGuildSettings = (guildId) => {
    return settingsCache.get(guildId) || null;
};

export const loadGuildSettings = async (guildId) => {
    try {
        const settingsRef = ref(database, `guilds/${guildId}/settings`);
        const snapshot = await get(settingsRef);
        const settings = snapshot.val() || {};
        settingsCache.set(guildId, settings);
        return settings;
    } catch (error) {
        console.error('Error loading guild settings:', error);
        return null;
    }
};

export const setGuildSetting = async (guildId, settings) => {
    try {
        const settingsRef = ref(database, `guilds/${guildId}/settings`);
        await update(settingsRef, {
            ...settings,
            updated_at: new Date().toISOString(),
        });

        const current = settingsCache.get(guildId) || {};
        settingsCache.set(guildId, { ...current, ...settings });
    } catch (error) {
        console.error('Error setting guild settings:', error);
    }
};

const rolesCache = new Map();

export const getGuildRoles = (guildId) => {
    return rolesCache.get(guildId) || null;
};

export const loadGuildRoles = async (guildId) => {
    try {
        const rolesRef = ref(database, `guilds/${guildId}/roles`);
        const snapshot = await get(rolesRef);
        const roles = snapshot.val() || {};
        rolesCache.set(guildId, roles);
        return roles;
    } catch (error) {
        console.error('Error loading guild roles:', error);
        return null;
    }
};

export const setGuildRole = async (guildId, roleType, roleId) => {
    try {
        const roleRef = ref(database, `guilds/${guildId}/roles/${roleType}`);
        await set(roleRef, String(roleId));

        const current = rolesCache.get(guildId) || {};
        current[roleType] = roleId;
        rolesCache.set(guildId, current);
        return true;
    } catch (error) {
        console.error('Error setting guild role:', error);
        return false;
    }
};

export const initializeGuildRoles = async (guildId, defaultRoles = {}) => {
    try {
        const rolesRef = ref(database, `guilds/${guildId}/roles`);
        const snapshot = await get(rolesRef);
        if (!snapshot.exists()) {
            await set(rolesRef, {
                owner_role_id: defaultRoles.owner ? String(defaultRoles.owner) : null,
                co_owner_role_id: defaultRoles.co_owner ? String(defaultRoles.co_owner) : null,
                admin_role_id: defaultRoles.admin ? String(defaultRoles.admin) : null,
                moderator_role_id: defaultRoles.moderator ? String(defaultRoles.moderator) : null,
                staff_role_id: defaultRoles.staff ? String(defaultRoles.staff) : null,
                operator_role_id: defaultRoles.operator ? String(defaultRoles.operator) : null,
                created_at: new Date().toISOString(),
            });
            return true;
        }
        return true;
    } catch (error) {
        console.error('Error initializing guild roles:', error);
        return false;
    }
};

export const addWarning = async (guildId, userId, warnedBy, reason) => {
    try {
        const warningsRef = ref(database, `guilds/${guildId}/warnings`);
        const newWarningRef = push(warningsRef);
        await set(newWarningRef, {
            user_id: String(userId),
            warned_by: String(warnedBy),
            reason,
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error adding warning:', error);
        return false;
    }
};

export const getWarnings = async (guildId, userId) => {
    try {
        const warningsRef = ref(database, `guilds/${guildId}/warnings`);
        const snapshot = await get(warningsRef);
        if (!snapshot.exists()) return [];

        const warnings = [];
        snapshot.forEach((childSnapshot) => {
            const warning = childSnapshot.val();
            if (warning.user_id === userId) {
                warnings.push({ id: childSnapshot.key, ...warning });
            }
        });
        return warnings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error('Error getting warnings:', error);
        return [];
    }
};

export const addLog = async (guildId, userId, action, reason, moderatorId) => {
    try {
        const logsRef = ref(database, `guilds/${guildId}/logs`);
        const newLogRef = push(logsRef);
        await set(newLogRef, {
            user_id: String(userId),
            action,
            reason,
            moderator_id: String(moderatorId),
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error adding log:', error);
        return false;
    }
};

export const getLogs = async (guildId, limit = 10) => {
    try {
        const logsRef = ref(database, `guilds/${guildId}/logs`);
        const snapshot = await get(logsRef);
        if (!snapshot.exists()) return [];

        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        return logs
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting logs:', error);
        return [];
    }
};

export const createTicket = async (ticketId, guildId, creatorId, channelId) => {
    try {
        const ticketRef = ref(database, `guilds/${guildId}/tickets/${ticketId}`);
        await set(ticketRef, {
            guild_id: String(guildId),
            creator_id: String(creatorId),
            channel_id: String(channelId),
            status: 'open',
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating ticket:', error);
        return false;
    }
};

export const closeTicket = async (ticketId, guildId) => {
    try {
        const ticketRef = ref(database, `guilds/${guildId}/tickets/${ticketId}`);
        await update(ticketRef, {
            status: 'closed',
            closed_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error closing ticket:', error);
        return false;
    }
};

export const getOpenTickets = async (guildId) => {
    try {
        const ticketsRef = ref(database, `guilds/${guildId}/tickets`);
        const snapshot = await get(ticketsRef);
        if (!snapshot.exists()) return [];

        const tickets = [];
        snapshot.forEach((childSnapshot) => {
            const ticket = childSnapshot.val();
            if (ticket.status === 'open') {
                tickets.push({ id: childSnapshot.key, ...ticket });
            }
        });
        return tickets;
    } catch (error) {
        console.error('Error getting open tickets:', error);
        return [];
    }
};

export const createReminder = async (userId, guildId, reminderText, remindAt) => {
    try {
        const remindersRef = ref(database, `reminders`);
        const newReminderRef = push(remindersRef);
        await set(newReminderRef, {
            user_id: String(userId),
            guild_id: String(guildId),
            reminder_text: reminderText,
            remind_at: remindAt,
            notified: false,
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating reminder:', error);
        return false;
    }
};

export const getPendingReminders = async () => {
    try {
        const remindersRef = ref(database, `reminders`);
        const snapshot = await get(remindersRef);
        if (!snapshot.exists()) return [];

        const now = new Date();
        const reminders = [];
        snapshot.forEach((childSnapshot) => {
            const reminder = childSnapshot.val();
            if (!reminder.notified && new Date(reminder.remind_at) <= now) {
                reminders.push({ id: childSnapshot.key, ...reminder });
            }
        });
        return reminders;
    } catch (error) {
        console.error('Error getting pending reminders:', error);
        return [];
    }
};

export const markReminderNotified = async (reminderId) => {
    try {
        const reminderRef = ref(database, `reminders/${reminderId}`);
        await update(reminderRef, {
            notified: true,
            notified_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error marking reminder notified:', error);
        return false;
    }
};

export const addReputation = async (guildId, userId, points) => {
    try {
        const repRef = ref(database, `guilds/${guildId}/reputation/${userId}`);
        const snapshot = await get(repRef);
        const current = snapshot.val() || { reputation_points: 0, total_upvotes: 0, total_downvotes: 0 };

        const upvotes = points > 0 ? points : 0;
        const downvotes = points < 0 ? Math.abs(points) : 0;

        await update(repRef, {
            reputation_points: (current.reputation_points || 0) + points,
            total_upvotes: (current.total_upvotes || 0) + upvotes,
            total_downvotes: (current.total_downvotes || 0) + downvotes,
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error adding reputation:', error);
        return false;
    }
};

export const getReputation = async (guildId, userId) => {
    try {
        const repRef = ref(database, `guilds/${guildId}/reputation/${userId}`);
        const snapshot = await get(repRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting reputation:', error);
        return null;
    }
};

export const getLeaderboard = async (guildId, limit = 10) => {
    try {
        const repRef = ref(database, `guilds/${guildId}/reputation`);
        const snapshot = await get(repRef);
        if (!snapshot.exists()) return [];

        const leaderboard = [];
        snapshot.forEach((childSnapshot) => {
            leaderboard.push({
                user_id: childSnapshot.key,
                ...childSnapshot.val(),
            });
        });
        return leaderboard
            .sort((a, b) => (b.reputation_points || 0) - (a.reputation_points || 0))
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
};

export const createSuggestion = async (guildId, userId, suggestionText) => {
    try {
        const suggestionsRef = ref(database, `guilds/${guildId}/suggestions`);
        const newSuggestionRef = push(suggestionsRef);
        await set(newSuggestionRef, {
            user_id: String(userId),
            suggestion_text: suggestionText,
            status: 'pending',
            upvotes: 0,
            downvotes: 0,
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating suggestion:', error);
        return false;
    }
};

export const getSuggestions = async (guildId, status = 'pending', limit = 10) => {
    try {
        const suggestionsRef = ref(database, `guilds/${guildId}/suggestions`);
        const snapshot = await get(suggestionsRef);
        if (!snapshot.exists()) return [];

        const suggestions = [];
        snapshot.forEach((childSnapshot) => {
            const suggestion = childSnapshot.val();
            if (suggestion.status === status) {
                suggestions.push({ id: childSnapshot.key, ...suggestion });
            }
        });
        return suggestions
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting suggestions:', error);
        return [];
    }
};

export const updateSuggestionStatus = async (guildId, suggestionId, status) => {
    try {
        const suggestionRef = ref(database, `guilds/${guildId}/suggestions/${suggestionId}`);
        await update(suggestionRef, {
            status,
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error updating suggestion status:', error);
        return false;
    }
};

export const createGiveaway = async (guildId, creatorId, prize, description, endsAt, winnersCount, channelId) => {
    try {
        const giveawaysRef = ref(database, `guilds/${guildId}/giveaways`);
        const newGiveawayRef = push(giveawaysRef);
        await set(newGiveawayRef, {
            creator_id: String(creatorId),
            prize,
            description,
            ends_at: endsAt,
            winners_count: winnersCount,
            channel_id: String(channelId),
            status: 'active',
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating giveaway:', error);
        return false;
    }
};

export const getActiveGiveaways = async (guildId) => {
    try {
        const giveawaysRef = ref(database, `guilds/${guildId}/giveaways`);
        const snapshot = await get(giveawaysRef);
        if (!snapshot.exists()) return [];

        const now = new Date();
        const giveaways = [];
        snapshot.forEach((childSnapshot) => {
            const giveaway = childSnapshot.val();
            if (giveaway.status === 'active' && new Date(giveaway.ends_at) > now) {
                giveaways.push({ id: childSnapshot.key, ...giveaway });
            }
        });
        return giveaways.sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
    } catch (error) {
        console.error('Error getting active giveaways:', error);
        return [];
    }
};

export const getGiveaway = async (guildId, giveawayId) => {
    try {
        const giveawayRef = ref(database, `guilds/${guildId}/giveaways/${giveawayId}`);
        const snapshot = await get(giveawayRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting giveaway:', error);
        return null;
    }
};

export const addGiveawayEntry = async (guildId, giveawayId, userId) => {
    try {
        const entryRef = ref(database, `guilds/${guildId}/giveaways/${giveawayId}/entries/${userId}`);
        await set(entryRef, {
            user_id: String(userId),
            entered_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error adding giveaway entry:', error);
        return false;
    }
};

export const getGiveawayEntries = async (guildId, giveawayId) => {
    try {
        const entriesRef = ref(database, `guilds/${guildId}/giveaways/${giveawayId}/entries`);
        const snapshot = await get(entriesRef);
        if (!snapshot.exists()) return [];

        const entries = [];
        snapshot.forEach((childSnapshot) => {
            entries.push(childSnapshot.key);
        });
        return entries;
    } catch (error) {
        console.error('Error getting giveaway entries:', error);
        return [];
    }
};

export const completeGiveaway = async (guildId, giveawayId) => {
    try {
        const giveawayRef = ref(database, `guilds/${guildId}/giveaways/${giveawayId}`);
        await update(giveawayRef, {
            status: 'completed',
            completed_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error completing giveaway:', error);
        return false;
    }
};

export const addExperience = async (guildId, userId, experience) => {
    try {
        const levelRef = ref(database, `guilds/${guildId}/leveling/${userId}`);
        const snapshot = await get(levelRef);
        const current = snapshot.val() || { level: 1, experience: 0 };

        await update(levelRef, {
            experience: (current.experience || 0) + experience,
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error adding experience:', error);
        return false;
    }
};

export const getLevelData = async (guildId, userId) => {
    try {
        const levelRef = ref(database, `guilds/${guildId}/leveling/${userId}`);
        const snapshot = await get(levelRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting level data:', error);
        return null;
    }
};

export const getLevelingLeaderboard = async (guildId, limit = 10) => {
    try {
        const levelRef = ref(database, `guilds/${guildId}/leveling`);
        const snapshot = await get(levelRef);
        if (!snapshot.exists()) return [];

        const leaderboard = [];
        snapshot.forEach((childSnapshot) => {
            leaderboard.push({
                user_id: childSnapshot.key,
                ...childSnapshot.val(),
            });
        });
        return leaderboard
            .sort((a, b) => {
                if ((b.level || 1) !== (a.level || 1)) {
                    return (b.level || 1) - (a.level || 1);
                }
                return (b.experience || 0) - (a.experience || 0);
            })
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting leveling leaderboard:', error);
        return [];
    }
};

export const logActivity = async (guildId, userId, action, description) => {
    try {
        const activityRef = ref(database, `guilds/${guildId}/activity_logs`);
        const newActivityRef = push(activityRef);
        await set(newActivityRef, {
            user_id: String(userId),
            action,
            description,
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
};

export const getActivityLogs = async (guildId, limit = 50) => {
    try {
        const activityRef = ref(database, `guilds/${guildId}/activity_logs`);
        const snapshot = await get(activityRef);
        if (!snapshot.exists()) return [];

        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        return logs
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting activity logs:', error);
        return [];
    }
};

export const getBotStats = async () => {
    try {
        const guildsRef = ref(database, 'guilds');
        const snapshot = await get(guildsRef);
        if (!snapshot.exists()) {
            return { guilds: 0, users: 0, recentActivity: 0 };
        }

        let guildCount = 0;
        let userCount = 0;
        let recentActivity = 0;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        snapshot.forEach((guildSnapshot) => {
            guildCount++;

            const statsRef = guildSnapshot.child('user_statistics');
            if (statsRef.exists()) {
                statsRef.forEach(() => {
                    userCount++;
                });
            }

            const activityRef = guildSnapshot.child('activity_logs');
            if (activityRef.exists()) {
                activityRef.forEach((logSnapshot) => {
                    const log = logSnapshot.val();
                    if (new Date(log.created_at) > oneDayAgo) {
                        recentActivity++;
                    }
                });
            }
        });

        return { guilds: guildCount, users: userCount, recentActivity };
    } catch (error) {
        console.error('Error getting bot stats:', error);
        return { guilds: 0, users: 0, recentActivity: 0 };
    }
};

export const createAdminUser = async (username, passwordHash) => {
    try {
        const adminRef = ref(database, `admin_users/${username}`);
        await set(adminRef, {
            username,
            password_hash: passwordHash,
            created_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }
};

export const getAdminUser = async (username) => {
    try {
        const adminRef = ref(database, `admin_users/${username}`);
        const snapshot = await get(adminRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting admin user:', error);
        return null;
    }
};

// ==================== RULES FUNCTIONS ====================

export const saveGuildRules = async (guildId, rules) => {
    try {
        const rulesRef = ref(database, `guilds/${guildId}/rules`);
        await set(rulesRef, {
            rules: rules,
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error saving guild rules:', error);
        return false;
    }
};

export const getGuildRules = async (guildId) => {
    try {
        const rulesRef = ref(database, `guilds/${guildId}/rules`);
        const snapshot = await get(rulesRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting guild rules:', error);
        return null;
    }
};

export const setRulesChannel = async (guildId, channelId, messageId = null) => {
    try {
        const settingsRef = ref(database, `guilds/${guildId}/settings`);
        await update(settingsRef, {
            rules_channel: String(channelId),
            rules_message_id: messageId ? String(messageId) : null,
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error setting rules channel:', error);
        return false;
    }
};

export const setVerifiedRole = async (guildId, roleId) => {
    try {
        const settingsRef = ref(database, `guilds/${guildId}/settings`);
        await update(settingsRef, {
            verified_role_id: String(roleId),
            updated_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error setting verified role:', error);
        return false;
    }
};

export const logRulesAgreement = async (guildId, userId) => {
    try {
        const agreementRef = ref(database, `guilds/${guildId}/rules_agreements/${userId}`);
        await set(agreementRef, {
            agreed_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error logging rules agreement:', error);
        return false;
    }
};

// ==================== POLL FUNCTIONS ====================

export const createPoll = async (guildId, creatorId, question, options, duration = null, multiChoice = false, channelId = null, messageId = null) => {
    try {
        const pollsRef = ref(database, `guilds/${guildId}/polls`);
        const newPollRef = push(pollsRef);
        const pollId = newPollRef.key;

        const optionsData = {};
        options.forEach((opt, index) => {
            optionsData[index] = {
                text: opt,
                votes: 0,
            };
        });

        await set(newPollRef, {
            creator_id: String(creatorId),
            question,
            options: optionsData,
            multi_choice: multiChoice,
            channel_id: channelId ? String(channelId) : null,
            message_id: messageId ? String(messageId) : null,
            ends_at: duration ? new Date(Date.now() + duration).toISOString() : null,
            status: 'active',
            voters: {},
            created_at: new Date().toISOString(),
        });

        return pollId;
    } catch (error) {
        console.error('Error creating poll:', error);
        return null;
    }
};

export const votePoll = async (guildId, pollId, optionIndex, userId) => {
    try {
        const pollRef = ref(database, `guilds/${guildId}/polls/${pollId}`);
        const snapshot = await get(pollRef);

        if (!snapshot.exists()) return { success: false, error: 'Poll not found' };

        const poll = snapshot.val();

        if (poll.status !== 'active') {
            return { success: false, error: 'Poll has ended' };
        }

        if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
            return { success: false, error: 'Poll has expired' };
        }

        // Check if user already voted (for single choice)
        if (!poll.multi_choice && poll.voters && poll.voters[userId]) {
            return { success: false, error: 'You have already voted', previousVote: poll.voters[userId] };
        }

        // Update vote count
        const currentVotes = poll.options[optionIndex]?.votes || 0;
        await update(ref(database, `guilds/${guildId}/polls/${pollId}/options/${optionIndex}`), {
            votes: currentVotes + 1,
        });

        // Record voter
        await set(ref(database, `guilds/${guildId}/polls/${pollId}/voters/${userId}`), {
            option: optionIndex,
            voted_at: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error voting poll:', error);
        return { success: false, error: error.message };
    }
};

export const getPoll = async (guildId, pollId) => {
    try {
        const pollRef = ref(database, `guilds/${guildId}/polls/${pollId}`);
        const snapshot = await get(pollRef);
        return snapshot.exists() ? { id: pollId, ...snapshot.val() } : null;
    } catch (error) {
        console.error('Error getting poll:', error);
        return null;
    }
};

export const getActivePolls = async (guildId) => {
    try {
        const pollsRef = ref(database, `guilds/${guildId}/polls`);
        const snapshot = await get(pollsRef);
        if (!snapshot.exists()) return [];

        const polls = [];
        snapshot.forEach((childSnapshot) => {
            const poll = childSnapshot.val();
            if (poll.status === 'active') {
                polls.push({ id: childSnapshot.key, ...poll });
            }
        });
        return polls;
    } catch (error) {
        console.error('Error getting active polls:', error);
        return [];
    }
};

export const endPoll = async (guildId, pollId) => {
    try {
        const pollRef = ref(database, `guilds/${guildId}/polls/${pollId}`);
        await update(pollRef, {
            status: 'ended',
            ended_at: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error ending poll:', error);
        return false;
    }
};

export const updatePollMessage = async (guildId, pollId, messageId) => {
    try {
        const pollRef = ref(database, `guilds/${guildId}/polls/${pollId}`);
        await update(pollRef, {
            message_id: String(messageId),
        });
        return true;
    } catch (error) {
        console.error('Error updating poll message:', error);
        return false;
    }
};

// ==================== INVITE LINK FUNCTIONS ====================

export const saveInviteLink = async (guildId, inviteCode, shortCode, creatorId, expiresAt = null) => {
    try {
        // Save to guild-specific invites
        const inviteRef = ref(database, `guilds/${guildId}/invites/${shortCode}`);
        await set(inviteRef, {
            invite_code: inviteCode,
            short_code: shortCode,
            full_url: `https://discord.gg/${inviteCode}`,
            creator_id: String(creatorId),
            uses: 0,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
        });

        // Also save to global short links for quick lookup
        const globalRef = ref(database, `short_links/${shortCode}`);
        await set(globalRef, {
            guild_id: String(guildId),
            invite_code: inviteCode,
            full_url: `https://discord.gg/${inviteCode}`,
            created_at: new Date().toISOString(),
        });

        return true;
    } catch (error) {
        console.error('Error saving invite link:', error);
        return false;
    }
};

export const getInviteByShortCode = async (shortCode) => {
    try {
        const globalRef = ref(database, `short_links/${shortCode}`);
        const snapshot = await get(globalRef);
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting invite by short code:', error);
        return null;
    }
};

export const getGuildInvites = async (guildId) => {
    try {
        const invitesRef = ref(database, `guilds/${guildId}/invites`);
        const snapshot = await get(invitesRef);
        if (!snapshot.exists()) return [];

        const invites = [];
        snapshot.forEach((childSnapshot) => {
            invites.push({ short_code: childSnapshot.key, ...childSnapshot.val() });
        });
        return invites.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error('Error getting guild invites:', error);
        return [];
    }
};

export const incrementInviteUses = async (guildId, shortCode) => {
    try {
        const inviteRef = ref(database, `guilds/${guildId}/invites/${shortCode}`);
        const snapshot = await get(inviteRef);
        if (!snapshot.exists()) return false;

        const current = snapshot.val();
        await update(inviteRef, {
            uses: (current.uses || 0) + 1,
            last_used: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error incrementing invite uses:', error);
        return false;
    }
};

export const deleteInviteLink = async (guildId, shortCode) => {
    try {
        await remove(ref(database, `guilds/${guildId}/invites/${shortCode}`));
        await remove(ref(database, `short_links/${shortCode}`));
        return true;
    } catch (error) {
        console.error('Error deleting invite link:', error);
        return false;
    }
};

export const getAllShortLinks = async () => {
    try {
        const linksRef = ref(database, 'short_links');
        const snapshot = await get(linksRef);
        if (!snapshot.exists()) return [];

        const links = [];
        snapshot.forEach((childSnapshot) => {
            links.push({ short_code: childSnapshot.key, ...childSnapshot.val() });
        });
        return links;
    } catch (error) {
        console.error('Error getting all short links:', error);
        return [];
    }
};

export { database };

