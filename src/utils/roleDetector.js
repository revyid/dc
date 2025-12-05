/**
 * Smart Role Detection Utility
 * Detects roles by type with support for emojis and name variations
 */

// Regex pattern to remove emojis and special characters
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{E0020}-\u{E007F}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu;

// Special characters commonly used in role names
const specialCharsRegex = /[「」『』【】〖〗《》〈〉｢｣⟨⟩⟪⟫⦃⦄⦅⦆⦇⦈⦉⦊★☆✦✧✪✫✬✭✮✯✰❂❃❄❅❆❇❈❉❊❋✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃⁂⁎⁑⁕※⁜⁂⌘☀☁☂☃☄☇☈☉☊☋⌂⌐⌑⌒⌓⌔⌕⌖⌗⌘⌙⌚⌛◆◇◈◉◊○●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◦◧◨◩◪◫◬◭◮◯▲△▴▵▶▷▸▹►▻▼▽▾▿◀◁◂◃◄◅■□▢▣▤▥▦▧▨▩▪▫▬▭▮▯▰▱▓▒░│┃║┄┅┆┇┈┉┊┋─━┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═╔╗╚╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬|~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;

/**
 * Clean role name by removing emojis and special characters
 * @param {string} name - Role name to clean
 * @returns {string} Cleaned role name
 */
export const cleanRoleName = (name) => {
    return name
        .replace(emojiRegex, '')
        .replace(specialCharsRegex, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

/**
 * Role type patterns for detection
 */
const ROLE_PATTERNS = {
    owner: ['owner', 'pemilik', 'founder', 'pendiri', 'ceo', 'boss', 'kepala'],
    co_owner: ['co-owner', 'coowner', 'co owner', 'wakil owner', 'vice owner', 'vp'],
    admin: ['admin', 'administrator', 'adm', 'pengelola'],
    moderator: ['moderator', 'mod', 'moderasi'],
    staff: ['staff', 'staf', 'helper', 'pembantu', 'support'],
    operator: ['operator', 'op', 'operator bot', 'bot operator']
};

/**
 * Priority order for role types (higher position = higher priority)
 * Used when multiple roles match the same pattern
 */
const ROLE_PRIORITY = {
    owner: 100,
    co_owner: 90,
    admin: 80,
    moderator: 70,
    staff: 60,
    operator: 50
};

/**
 * Detect role by type from guild roles
 * @param {Collection} roles - Guild roles collection
 * @param {string} roleType - Type of role to detect (owner, admin, moderator, etc.)
 * @returns {Role|null} Detected role or null
 */
export const detectRoleByType = (roles, roleType) => {
    const patterns = ROLE_PATTERNS[roleType];
    if (!patterns) return null;

    // Find all matching roles
    const matchingRoles = roles.filter(role => {
        const cleanedName = cleanRoleName(role.name);
        return patterns.some(pattern => cleanedName.includes(pattern));
    });

    if (matchingRoles.size === 0) return null;

    // Return the role with highest position (most likely the real one)
    return matchingRoles.sort((a, b) => b.position - a.position).first();
};

/**
 * Auto-detect all role types from guild
 * @param {Guild} guild - Discord guild object
 * @returns {Object} Object with detected role IDs
 */
export const autoDetectRoles = (guild) => {
    const roles = guild.roles.cache;
    const detectedRoles = {};

    for (const roleType of Object.keys(ROLE_PATTERNS)) {
        const role = detectRoleByType(roles, roleType);
        if (role) {
            detectedRoles[roleType] = String(role.id);
            console.log(`  ✓ Detected ${roleType}: "${role.name}" (cleaned: "${cleanRoleName(role.name)}")`);
        }
    }

    return detectedRoles;
};

/**
 * Check if a role name matches a specific type
 * @param {string} roleName - Role name to check
 * @param {string} roleType - Type to match against
 * @returns {boolean} True if matches
 */
export const matchesRoleType = (roleName, roleType) => {
    const patterns = ROLE_PATTERNS[roleType];
    if (!patterns) return false;

    const cleanedName = cleanRoleName(roleName);
    return patterns.some(pattern => cleanedName.includes(pattern));
};

export default {
    cleanRoleName,
    detectRoleByType,
    autoDetectRoles,
    matchesRoleType,
    ROLE_PATTERNS,
    ROLE_PRIORITY
};
