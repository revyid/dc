import { getGuildRoles, loadGuildRoles } from './db-firebase.js';
import { isBotOwner } from './ownerControl.js';

// Permission levels from highest to lowest
export const PERMISSION_LEVELS = {
  BOT_OWNER: 0,
  OWNER: 1,
  CO_OWNER: 2,
  ADMIN: 3,
  MODERATOR: 4,
  STAFF: 5,
  OPERATOR: 6,
  EVERYONE: 7,
};

// Command permission configuration
export const COMMAND_PERMISSIONS = {
  // Bot owner only
  owner: PERMISSION_LEVELS.BOT_OWNER,

  // Server owner/admin commands
  settings: PERMISSION_LEVELS.ADMIN,
  setrole: PERMISSION_LEVELS.ADMIN,
  rules: PERMISSION_LEVELS.ADMIN,

  // Moderation commands
  ban: PERMISSION_LEVELS.MODERATOR,
  kick: PERMISSION_LEVELS.MODERATOR,
  mute: PERMISSION_LEVELS.MODERATOR,
  unmute: PERMISSION_LEVELS.MODERATOR,
  warn: PERMISSION_LEVELS.MODERATOR,
  clear: PERMISSION_LEVELS.MODERATOR,

  // Staff commands
  ticket: PERMISSION_LEVELS.STAFF,
  logs: PERMISSION_LEVELS.STAFF,

  // Everyone can use
  help: PERMISSION_LEVELS.EVERYONE,
  ping: PERMISSION_LEVELS.EVERYONE,
  avatar: PERMISSION_LEVELS.EVERYONE,
  userinfo: PERMISSION_LEVELS.EVERYONE,
  serverinfo: PERMISSION_LEVELS.EVERYONE,
  level: PERMISSION_LEVELS.EVERYONE,
  leaderboard: PERMISSION_LEVELS.EVERYONE,
  profile: PERMISSION_LEVELS.EVERYONE,
  coinflip: PERMISSION_LEVELS.EVERYONE,
  dice: PERMISSION_LEVELS.EVERYONE,
  rps: PERMISSION_LEVELS.EVERYONE,
  quiz: PERMISSION_LEVELS.EVERYONE,
  joke: PERMISSION_LEVELS.EVERYONE,
  invite: PERMISSION_LEVELS.EVERYONE,
  poll: PERMISSION_LEVELS.EVERYONE,
};

export const hasAdminRole = async (member, roleType = 'admin') => {
  if (!member) return false;

  const guildId = member.guild?.id;

  if (!guildId) {
    return false;
  }

  let roles = getGuildRoles(guildId);

  if (!roles) {
    roles = await loadGuildRoles(guildId);
  }

  if (!roles) return false;

  const roleMapping = {
    owner: roles.owner_role_id,
    'co-owner': roles.co_owner_role_id,
    admin: roles.admin_role_id,
    moderator: roles.moderator_role_id,
    staff: roles.staff_role_id,
    operator: roles.operator_role_id,
  };

  const requiredRoleId = roleMapping[roleType] || roles.admin_role_id;
  if (!requiredRoleId) return false;

  if (member.roles?.cache) {
    return member.roles.cache.has(requiredRoleId);
  } else if (Array.isArray(member.roles)) {
    return member.roles.includes(requiredRoleId);
  }

  return false;
};

// Get user's permission level
export const getUserPermissionLevel = async (member) => {
  if (!member) return PERMISSION_LEVELS.EVERYONE;

  // Check if bot owner
  if (isBotOwner(member.user?.id || member.id)) {
    return PERMISSION_LEVELS.BOT_OWNER;
  }

  // Check guild roles in order of priority
  if (await hasAdminRole(member, 'owner')) return PERMISSION_LEVELS.OWNER;
  if (await hasAdminRole(member, 'co-owner')) return PERMISSION_LEVELS.CO_OWNER;
  if (await hasAdminRole(member, 'admin')) return PERMISSION_LEVELS.ADMIN;
  if (await hasAdminRole(member, 'moderator')) return PERMISSION_LEVELS.MODERATOR;
  if (await hasAdminRole(member, 'staff')) return PERMISSION_LEVELS.STAFF;
  if (await hasAdminRole(member, 'operator')) return PERMISSION_LEVELS.OPERATOR;

  return PERMISSION_LEVELS.EVERYONE;
};

// Check if user has permission to use a command
export const hasCommandPermission = async (member, commandName) => {
  const requiredLevel = COMMAND_PERMISSIONS[commandName] ?? PERMISSION_LEVELS.EVERYONE;
  const userLevel = await getUserPermissionLevel(member);

  // Lower number = higher permission
  return userLevel <= requiredLevel;
};

// Get permission level name for display
export const getPermissionLevelName = (level) => {
  const names = {
    [PERMISSION_LEVELS.BOT_OWNER]: 'Bot Owner',
    [PERMISSION_LEVELS.OWNER]: 'Owner',
    [PERMISSION_LEVELS.CO_OWNER]: 'Co-Owner',
    [PERMISSION_LEVELS.ADMIN]: 'Admin',
    [PERMISSION_LEVELS.MODERATOR]: 'Moderator',
    [PERMISSION_LEVELS.STAFF]: 'Staff',
    [PERMISSION_LEVELS.OPERATOR]: 'Operator',
    [PERMISSION_LEVELS.EVERYONE]: 'Everyone',
  };
  return names[level] || 'Unknown';
};

export const checkPermission = (member, requiredRoleId) => {
  if (!member || !requiredRoleId) return true;

  if (member.roles?.cache) {
    return member.roles.cache.has(requiredRoleId);
  } else if (Array.isArray(member.roles)) {
    return member.roles.includes(requiredRoleId);
  }

  return false;
};

export const getPermissionErrorMessage = (roleName) => {
  return `❌ You need the **${roleName}** role to use this command.`;
};

export const requireOwner = async (member) => {
  return await hasAdminRole(member, 'owner');
};

export const requireCoOwner = async (member) => {
  return await hasAdminRole(member, 'co-owner');
};

export const requireAdmin = async (member) => {
  return await hasAdminRole(member, 'admin');
};

export const requireModerator = async (member) => {
  return await hasAdminRole(member, 'moderator');
};

export const requireStaff = async (member) => {
  return await hasAdminRole(member, 'staff');
};

export const requireOperator = async (member) => {
  return await hasAdminRole(member, 'operator');
};

export const hasMinimumRole = async (member, minimumRoleType) => {
  if (!member) return false;

  const roleHierarchy = ['owner', 'co-owner', 'admin', 'moderator', 'staff', 'operator'];
  const minimumIndex = roleHierarchy.indexOf(minimumRoleType);

  if (minimumIndex === -1) return false;

  for (let i = 0; i <= minimumIndex; i++) {
    const hasRole = await hasAdminRole(member, roleHierarchy[i]);
    if (hasRole) {
      return true;
    }
  }

  return false;
};