/**
 * Bot Owner Control Utility
 * Provides special permissions and controls for the bot owner
 */

// Bot Owner ID - has full control over the bot
export const BOT_OWNER_ID = '1190907689321103391';

// List of co-owners (optional, can add more later)
export const BOT_CO_OWNERS = [];

/**
 * Check if a user is the bot owner
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is the bot owner
 */
export const isBotOwner = (userId) => {
    return String(userId) === BOT_OWNER_ID;
};

/**
 * Check if a user is a bot owner or co-owner
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is owner or co-owner
 */
export const isBotAdmin = (userId) => {
    const id = String(userId);
    return id === BOT_OWNER_ID || BOT_CO_OWNERS.includes(id);
};

/**
 * Get permission error message for owner-only commands
 * @returns {string} Error message
 */
export const getOwnerOnlyMessage = () => {
    return '❌ This command can only be used by the bot owner.';
};

/**
 * Owner permission levels
 */
export const OwnerPermissionLevel = {
    OWNER: 'owner',       // Full control
    CO_OWNER: 'co_owner', // Almost full control
    DEVELOPER: 'developer' // Limited control (future use)
};

/**
 * Get user's bot permission level
 * @param {string} userId - User ID to check
 * @returns {string|null} Permission level or null
 */
export const getBotPermissionLevel = (userId) => {
    const id = String(userId);
    if (id === BOT_OWNER_ID) return OwnerPermissionLevel.OWNER;
    if (BOT_CO_OWNERS.includes(id)) return OwnerPermissionLevel.CO_OWNER;
    return null;
};

export default {
    BOT_OWNER_ID,
    BOT_CO_OWNERS,
    isBotOwner,
    isBotAdmin,
    getOwnerOnlyMessage,
    OwnerPermissionLevel,
    getBotPermissionLevel
};
