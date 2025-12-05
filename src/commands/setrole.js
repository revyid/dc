import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { setGuildRole, loadGuildRoles } from '../utils/database.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setrole')
        .setDescription('Set a staff role for the server')
        .addStringOption(option =>
      option.setName('type')
                .setDescription('Role type')
                .setRequired(true)
                .addChoices(
                    { name: '👑 Owner', value: 'owner_role_id' },
                    { name: '🎖️ Co-Owner', value: 'co_owner_role_id' },
                    { name: '⭐ Admin', value: 'admin_role_id' },
                    { name: '🛡️ Moderator', value: 'moderator_role_id' },
                    { name: '👮 Staff', value: 'staff_role_id' },
                    { name: '⚙️ Operator', value: 'operator_role_id' }
                )
        )
        .addRoleOption(option =>
      option.setName('role').setDescription('Role to assign').setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    adminOnly: true,
    async execute(interaction) {
        const roleType = interaction.options.getString('type');
        const role = interaction.options.getRole('role');

        try {
            await setGuildRole(interaction.guildId, roleType, role.id);
            await loadGuildRoles(interaction.guildId);

            const roleNames = {
                owner_role_id: 'Owner',
                co_owner_role_id: 'Co-Owner',
                admin_role_id: 'Admin',
                moderator_role_id: 'Moderator',
                staff_role_id: 'Staff',
                operator_role_id: 'Operator',
            };

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('✓ Role Updated')
                .setDescription(`**${roleNames[roleType]}** role has been set to ${role}`)
                .setFooter({ text: 'Role permissions will take effect immediately' });

            await interaction.reply({ embeds: [embed], flags: 64 });
        } catch (error) {
            console.error('Setrole command error:', error);
            await interaction.reply({ content: '❌ Failed to update role.', flags: 64 });
        }
    },
};
