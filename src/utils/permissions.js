export const hasAdminRole = (member, roleType = 'admin') => {
  const adminRole = process.env.ADMIN_ROLE;
  const moderatorRole = process.env.MODERATOR_ROLE;
  const operatorRole = process.env.OPERATOR_ROLE;

  const roles = {
    admin: adminRole,
    moderator: moderatorRole,
    operator: operatorRole,
  };

  const requiredRole = roles[roleType] || roles.admin;

  if (!requiredRole) return false;

  return member.roles.cache.some(role =>
    role.name.toLowerCase() === requiredRole.toLowerCase()
  );
};

export const checkPermission = (member, requiredRole) => {
  if (!requiredRole) return true;

  return member.roles.cache.some(role =>
    role.name.toLowerCase() === requiredRole.toLowerCase()
  );
};

export const getPermissionErrorMessage = (requiredRole) => {
  return `❌ You need the **${requiredRole}** role to use this command.`;
};

export const requireAdmin = (member) => {
  const adminRole = process.env.ADMIN_ROLE;
  return checkPermission(member, adminRole);
};

export const requireModerator = (member) => {
  const moderatorRole = process.env.MODERATOR_ROLE;
  return checkPermission(member, moderatorRole);
};

export const requireOperator = (member) => {
  const operatorRole = process.env.OPERATOR_ROLE;
  return checkPermission(member, operatorRole);
};
