import { EmbedBuilder } from 'discord.js';
import { votePoll, getPoll, endPoll } from '../utils/db-firebase.js';
import { hasMinimumRole } from '../utils/permissions.js';

const POLL_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

// Handler for poll vote buttons
export const pollVote = {
    customId: /^poll_vote_(.+)_(\d+)$/,

    async execute(interaction) {
        const match = interaction.customId.match(/^poll_vote_(.+)_(\d+)$/);
        if (!match) return;

        const pollId = match[1];
        const optionIndex = parseInt(match[2]);

        await interaction.deferReply({ flags: 64 });

        // Get poll data
        const poll = await getPoll(interaction.guildId, pollId);

        if (!poll) {
            return interaction.editReply({
                content: '❌ Poll not found!',
            });
        }

        if (poll.status !== 'active') {
            return interaction.editReply({
                content: '❌ This poll has ended!',
            });
        }

        // Check expiration
        if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
            return interaction.editReply({
                content: '❌ This poll has expired!',
            });
        }

        // Vote
        const result = await votePoll(interaction.guildId, pollId, optionIndex, interaction.user.id);

        if (!result.success) {
            return interaction.editReply({
                content: `❌ ${result.error}`,
            });
        }

        // Get updated poll to show updated counts
        const updatedPoll = await getPoll(interaction.guildId, pollId);
        const optionText = updatedPoll.options[optionIndex]?.text || `Option ${optionIndex + 1}`;

        // Update the poll message with new vote counts
        try {
            const message = await interaction.message.fetch();

            const totalVotes = Object.values(updatedPoll.options || {}).reduce((sum, opt) => sum + (opt.votes || 0), 0);
            const optionsText = Object.entries(updatedPoll.options || {}).map(([idx, opt]) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
                return `${POLL_EMOJIS[idx]} ${opt.text}\n${bar} **${opt.votes}** (${percentage}%)`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle('📊 ' + updatedPoll.question)
                .setDescription(optionsText)
                .addFields(
                    { name: 'Total Votes', value: String(totalVotes), inline: true },
                    { name: 'Type', value: updatedPoll.multi_choice ? 'Multi-choice' : 'Single choice', inline: true }
                )
                .setFooter({ text: `Poll ID: ${pollId}` })
                .setTimestamp();

            if (updatedPoll.ends_at) {
                embed.addFields({ name: 'Ends', value: `<t:${Math.floor(new Date(updatedPoll.ends_at).getTime() / 1000)}:R>`, inline: true });
            }

            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error('Error updating poll message:', error);
        }

        return interaction.editReply({
            content: `✅ You voted for **${optionText}**!`,
        });
    },
};

// Handler for poll end button
export const pollEnd = {
    customId: /^poll_end_(.+)$/,

    async execute(interaction) {
        const match = interaction.customId.match(/^poll_end_(.+)$/);
        if (!match) return;

        const pollId = match[1];

        await interaction.deferReply({ flags: 64 });

        const poll = await getPoll(interaction.guildId, pollId);

        if (!poll) {
            return interaction.editReply({
                content: '❌ Poll not found!',
            });
        }

        // Check if user is creator or admin
        const isCreator = poll.creator_id === interaction.user.id;
        const isAdmin = await hasMinimumRole(interaction.member, 'admin');

        if (!isCreator && !isAdmin) {
            return interaction.editReply({
                content: '❌ Only the poll creator or admins can end this poll!',
            });
        }

        // End the poll
        await endPoll(interaction.guildId, pollId);

        // Update the message to show final results
        try {
            const message = await interaction.message.fetch();

            const totalVotes = Object.values(poll.options || {}).reduce((sum, opt) => sum + (opt.votes || 0), 0);
            const optionsText = Object.entries(poll.options || {}).map(([idx, opt]) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
                return `${POLL_EMOJIS[idx]} ${opt.text}\n${bar} **${opt.votes}** (${percentage}%)`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(0xed4245) // Red for ended
                .setTitle('📊 [ENDED] ' + poll.question)
                .setDescription(optionsText)
                .addFields(
                    { name: 'Total Votes', value: String(totalVotes), inline: true },
                    { name: 'Status', value: '🔴 Ended', inline: true }
                )
                .setFooter({ text: `Poll ID: ${pollId}` })
                .setTimestamp();

            // Remove buttons from ended poll
            await message.edit({ embeds: [embed], components: [] });
        } catch (error) {
            console.error('Error updating ended poll message:', error);
        }

        return interaction.editReply({
            content: '✅ Poll has been ended!',
        });
    },
};

export default pollVote;
