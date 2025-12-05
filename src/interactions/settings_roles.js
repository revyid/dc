import { EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder } from 'discord.js';
import { getGuildRoles, setGuildRole, loadGuildRoles } from '../utils/database.js';

export default {
    customId: 'settings_roles',
    async execute(interaction) {
        const roles = getGuildRoles(interaction.guildId) || {};

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('👑 Staff Roles Configuration')
            .setDescription('Configure staff roles for this server using `/setrole`')
            .addFields(
                {
                    name: '📋 Current Configuration',
                    value: `👑 Owner: ${roles.owner_role_id ? `<@&${roles.owner_role_id}>` : '❌'}\n🎖️ Co-Owner: ${roles.co_owner_role_id ? `<@&${roles.co_owner_role_id}>` : '❌'}\n⭐ Admin: ${roles.admin_role_id ? `<@&${roles.admin_role_id}>` : '❌'}\n🛡️ Moderator: ${roles.moderator_role_id ? `<@&${roles.moderator_role_id}>` : '❌'}\n👮 Staff: ${roles.staff_role_id ? `<@&${roles.staff_role_id}>` : '❌'}\n⚙️ Operator: ${roles.operator_role_id ? `<@&${roles.operator_role_id}>` : '❌'}`,
                    inline: false,
                },
                {
                    name: '💡 How to Configure',
                    value: 'Use `/setrole` command to set each role type.',
                    inline: false,
                },
                {
                    name: '📌 Role Hierarchy',
                    value: 'Owner > Co-Owner > Admin > Moderator > Staff > Operator',
                    inline: false,
                }
            )
            .setFooter({ text: 'Role permissions apply immediately after configuration' });

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
