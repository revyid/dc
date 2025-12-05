import { EmbedBuilder } from 'discord.js';
import { logRulesAgreement, loadGuildSettings, getGuildSettings } from '../utils/db-firebase.js';

export default {
    customId: 'rules_agree',

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        try {
            // Load settings to get verified role
            await loadGuildSettings(interaction.guildId);
            const settings = getGuildSettings(interaction.guildId);

            // Log agreement
            await logRulesAgreement(interaction.guildId, interaction.user.id);

            // If verified role is set, give it to user
            if (settings?.verified_role_id) {
                const role = interaction.guild.roles.cache.get(settings.verified_role_id);

                if (role) {
                    try {
                        await interaction.member.roles.add(role);

                        return interaction.editReply({
                            content: `✅ Thank you for agreeing to the rules! You have been given the ${role} role.`,
                        });
                    } catch (error) {
                        console.error('Error adding verified role:', error);
                        return interaction.editReply({
                            content: '✅ Thank you for agreeing to the rules! (Could not assign role - please contact an admin)',
                        });
                    }
                }
            }

            return interaction.editReply({
                content: '✅ Thank you for agreeing to the rules! Welcome to the server.',
            });
        } catch (error) {
            console.error('Error processing rules agreement:', error);
            return interaction.editReply({
                content: '❌ An error occurred. Please try again.',
            });
        }
    },
};
