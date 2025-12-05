/**
 * Database Structure Validator & Auto-Repair Utility
 * Validates and repairs guild database structures on bot startup
 */

import { ref, get, set, update } from 'firebase/database';
import { database, loadGuildRoles, setGuildRole } from './db-firebase.js';
import { autoDetectRoles } from './roleDetector.js';

/**
 * Required database structure for each guild
 */
const REQUIRED_GUILD_STRUCTURE = {
    settings: {
        welcome_channel_id: null,
        goodbye_channel_id: null,
        log_channel_id: null,
        welcome_message: 'Welcome {user} to {server}!',
        goodbye_message: 'Goodbye {user}!',
        auto_role_id: null,
        updated_at: null
    },
    roles: {
        owner_role_id: null,
        co_owner_role_id: null,
        admin_role_id: null,
        moderator_role_id: null,
        staff_role_id: null,
        operator_role_id: null,
        created_at: null
    }
};

/**
 * Validate a single guild's database structure
 * @param {string} guildId - Guild ID to validate
 * @returns {Object} Validation result with missing fields
 */
export const validateGuildDatabase = async (guildId) => {
    const result = {
        guildId,
        isValid: true,
        missingFields: [],
        existingFields: []
    };

    try {
        const guildRef = ref(database, `guilds/${guildId}`);
        const snapshot = await get(guildRef);
        const guildData = snapshot.val() || {};

        // Check settings
        if (!guildData.settings) {
            result.missingFields.push('settings (entire section)');
            result.isValid = false;
        } else {
            for (const [key, defaultValue] of Object.entries(REQUIRED_GUILD_STRUCTURE.settings)) {
                if (guildData.settings[key] === undefined) {
                    result.missingFields.push(`settings.${key}`);
                    result.isValid = false;
                } else {
                    result.existingFields.push(`settings.${key}`);
                }
            }
        }

        // Check roles
        if (!guildData.roles) {
            result.missingFields.push('roles (entire section)');
            result.isValid = false;
        } else {
            for (const [key, defaultValue] of Object.entries(REQUIRED_GUILD_STRUCTURE.roles)) {
                if (guildData.roles[key] === undefined) {
                    result.missingFields.push(`roles.${key}`);
                    result.isValid = false;
                } else {
                    result.existingFields.push(`roles.${key}`);
                }
            }
        }

    } catch (error) {
        console.error(`Error validating guild ${guildId}:`, error);
        result.isValid = false;
        result.error = error.message;
    }

    return result;
};

/**
 * Repair a guild's database structure
 * @param {string} guildId - Guild ID to repair
 * @param {Guild} guild - Discord guild object for role detection
 * @returns {Object} Repair result
 */
export const repairGuildDatabase = async (guildId, guild = null) => {
    const result = {
        guildId,
        repaired: [],
        failed: [],
        rolesDetected: {}
    };

    try {
        const guildRef = ref(database, `guilds/${guildId}`);
        const snapshot = await get(guildRef);
        const guildData = snapshot.val() || {};

        // Detect roles from guild if available
        let detectedRoles = {};
        if (guild) {
            console.log(`  📍 Scanning roles in guild: ${guild.name}`);
            detectedRoles = autoDetectRoles(guild);
            result.rolesDetected = detectedRoles;
        }

        // Repair settings
        if (!guildData.settings) {
            const settingsRef = ref(database, `guilds/${guildId}/settings`);
            await set(settingsRef, {
                ...REQUIRED_GUILD_STRUCTURE.settings,
                created_at: new Date().toISOString()
            });
            result.repaired.push('settings (created entire section)');
        } else {
            const settingsRef = ref(database, `guilds/${guildId}/settings`);
            const updates = {};
            for (const [key, defaultValue] of Object.entries(REQUIRED_GUILD_STRUCTURE.settings)) {
                if (guildData.settings[key] === undefined) {
                    updates[key] = defaultValue;
                    result.repaired.push(`settings.${key}`);
                }
            }
            if (Object.keys(updates).length > 0) {
                await update(settingsRef, updates);
            }
        }

        // Repair roles
        if (!guildData.roles) {
            const rolesRef = ref(database, `guilds/${guildId}/roles`);
            const roleData = {
                owner_role_id: detectedRoles.owner || null,
                co_owner_role_id: detectedRoles.co_owner || null,
                admin_role_id: detectedRoles.admin || null,
                moderator_role_id: detectedRoles.moderator || null,
                staff_role_id: detectedRoles.staff || null,
                operator_role_id: detectedRoles.operator || null,
                created_at: new Date().toISOString()
            };
            await set(rolesRef, roleData);
            result.repaired.push('roles (created entire section with auto-detected roles)');
        } else {
            const rolesRef = ref(database, `guilds/${guildId}/roles`);
            const updates = {};

            // Map for role type to field name
            const roleFieldMap = {
                owner: 'owner_role_id',
                co_owner: 'co_owner_role_id',
                admin: 'admin_role_id',
                moderator: 'moderator_role_id',
                staff: 'staff_role_id',
                operator: 'operator_role_id'
            };

            for (const [key, defaultValue] of Object.entries(REQUIRED_GUILD_STRUCTURE.roles)) {
                if (guildData.roles[key] === undefined) {
                    // Try to use detected role if available
                    const roleType = Object.keys(roleFieldMap).find(k => roleFieldMap[k] === key);
                    const detectedValue = roleType ? detectedRoles[roleType] : null;
                    updates[key] = detectedValue || defaultValue;
                    result.repaired.push(`roles.${key}${detectedValue ? ' (auto-detected)' : ''}`);
                }
            }
            if (Object.keys(updates).length > 0) {
                await update(rolesRef, updates);
            }
        }

    } catch (error) {
        console.error(`Error repairing guild ${guildId}:`, error);
        result.failed.push(`Error: ${error.message}`);
    }

    return result;
};

/**
 * Check and repair all guilds the bot is in
 * @param {Client} client - Discord client
 * @returns {Object} Summary of all validations and repairs
 */
export const checkAllGuilds = async (client) => {
    console.log('\n🔍 Starting database structure validation for all guilds...');

    const summary = {
        totalGuilds: 0,
        validGuilds: 0,
        repairedGuilds: 0,
        failedGuilds: 0,
        details: []
    };

    for (const [guildId, guild] of client.guilds.cache) {
        summary.totalGuilds++;
        console.log(`\n📋 Checking guild: ${guild.name} (${guildId})`);

        try {
            // Validate
            const validation = await validateGuildDatabase(guildId);

            if (validation.isValid) {
                console.log(`  ✅ Database structure is valid`);
                summary.validGuilds++;
            } else {
                console.log(`  ⚠️ Missing fields detected: ${validation.missingFields.join(', ')}`);

                // Repair
                const repair = await repairGuildDatabase(guildId, guild);

                if (repair.repaired.length > 0) {
                    console.log(`  🔧 Auto-repaired: ${repair.repaired.join(', ')}`);
                    summary.repairedGuilds++;
                }

                if (repair.failed.length > 0) {
                    console.log(`  ❌ Failed to repair: ${repair.failed.join(', ')}`);
                    summary.failedGuilds++;
                }

                summary.details.push({
                    guildId,
                    guildName: guild.name,
                    missing: validation.missingFields,
                    repaired: repair.repaired,
                    rolesDetected: repair.rolesDetected
                });
            }
        } catch (error) {
            console.error(`  ❌ Error processing guild ${guild.name}:`, error);
            summary.failedGuilds++;
        }
    }

    console.log('\n📊 Database Validation Summary:');
    console.log(`  Total guilds: ${summary.totalGuilds}`);
    console.log(`  Already valid: ${summary.validGuilds}`);
    console.log(`  Auto-repaired: ${summary.repairedGuilds}`);
    console.log(`  Failed: ${summary.failedGuilds}`);
    console.log('');

    return summary;
};

/**
 * Force re-detect roles for a specific guild
 * @param {string} guildId - Guild ID
 * @param {Guild} guild - Discord guild object
 * @returns {Object} Detection result
 */
export const redetectGuildRoles = async (guildId, guild) => {
    console.log(`\n🔄 Re-detecting roles for guild: ${guild.name}`);

    const detectedRoles = autoDetectRoles(guild);

    // Update database with detected roles
    for (const [roleType, roleId] of Object.entries(detectedRoles)) {
        const fieldName = `${roleType}_role_id`;
        await setGuildRole(guildId, fieldName, roleId);
    }

    console.log(`  ✅ Updated ${Object.keys(detectedRoles).length} roles in database`);

    return detectedRoles;
};

export default {
    validateGuildDatabase,
    repairGuildDatabase,
    checkAllGuilds,
    redetectGuildRoles,
    REQUIRED_GUILD_STRUCTURE
};
