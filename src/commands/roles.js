import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildRoles, setGuildRole } from '../utils/database.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Configure staff roles for the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    adminOnly: true,
    async execute(interaction) {
        const roles = getGuildRoles(interaction.guildId) || {};

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('👑 Staff Roles Configuration')
            .setDescription('Configure which roles can use admin, moderator, and staff commands.')
            .addFields(
                { name: '👑 Owner', value: roles.owner_role_id ? `\u003c@\u0026${roles.owner_role_id}>` : '❌ Not set', inline: true },
                { name: '🎖️ Co-Owner', value: roles.co_owner_role_id ? `\u003c@\u0026${roles.co_owner_role_id}>` : '❌ Not set', inline: true },
                { name: '⭐ Admin', value: roles.admin_role_id ? `\u003c@\u0026${roles.admin_role_id}>` : '❌ Not set', inline: true },
                { name: '🛡️ Moderator', value: roles.moderator_role_id ? `\u003c@\u0026${roles.moderator_role_id}>` : '❌ Not set', inline: true },
                { name: '👮 Staff', value: roles.staff_role_id ? `\u003c@\u0026${roles.staff_role_id}>` : '❌ Not set', inline: true },
                { name: '⚙️ Operator', value: roles.operator_role_id ? `\u003c@\u0026${roles.operator_role_id}>` : '❌ Not set', inline: true }
            )
            .setFooter({ text: 'Use /setrole to configure each role' });

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
