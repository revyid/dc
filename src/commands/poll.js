import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { createPoll, getPoll, endPoll, updatePollMessage, getActivePolls } from '../utils/db-firebase.js';
import { hasMinimumRole } from '../utils/permissions.js';

// Emoji options for poll
const POLL_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('📊 Create and manage polls')
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a new poll')
                .addStringOption(opt =>
                    opt.setName('question')
                        .setDescription('The poll question')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('options')
                        .setDescription('Poll options separated by | (e.g., Option 1|Option 2|Option 3)')
                        .setRequired(true))
                .addIntegerOption(opt =>
                    opt.setName('duration')
                        .setDescription('Poll duration in minutes (optional)')
                        .setMinValue(1)
                        .setMaxValue(10080)) // Max 1 week
                .addBooleanOption(opt =>
                    opt.setName('multi_choice')
                        .setDescription('Allow multiple choice voting')))
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('End a poll early')
                .addStringOption(opt =>
                    opt.setName('poll_id')
                        .setDescription('Poll ID to end')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List active polls')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create': {
                await interaction.deferReply();

                const question = interaction.options.getString('question');
                const optionsRaw = interaction.options.getString('options');
                const durationMinutes = interaction.options.getInteger('duration');
                const multiChoice = interaction.options.getBoolean('multi_choice') || false;

                // Parse options
                const options = optionsRaw.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

                if (options.length < 2) {
                    return interaction.editReply({
                        content: '❌ You need at least 2 options! Separate them with `|`',
                    });
                }

                if (options.length > 10) {
                    return interaction.editReply({
                        content: '❌ Maximum 10 options allowed!',
                    });
                }

                // Calculate duration in milliseconds
                const duration = durationMinutes ? durationMinutes * 60 * 1000 : null;

                // Create poll in database
                const pollId = await createPoll(
                    interaction.guildId,
                    interaction.user.id,
                    question,
                    options,
                    duration,
                    multiChoice,
                    interaction.channelId
                );

                if (!pollId) {
                    return interaction.editReply({
                        content: '❌ Failed to create poll!',
                    });
                }

                // Build poll embed
                const optionsText = options.map((opt, i) => `${POLL_EMOJIS[i]} ${opt} - **0** votes`).join('\n');

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('📊 ' + question)
                    .setDescription(optionsText)
                    .addFields(
                        { name: 'Total Votes', value: '0', inline: true },
                        { name: 'Type', value: multiChoice ? 'Multi-choice' : 'Single choice', inline: true }
                    )
                    .setFooter({ text: `Poll ID: ${pollId}` })
                    .setTimestamp();

                if (durationMinutes) {
                    const endsAt = new Date(Date.now() + duration);
                    embed.addFields({ name: 'Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true });
                }

                // Create vote buttons
                const rows = [];
                let currentRow = new ActionRowBuilder();

                for (let i = 0; i < options.length; i++) {
                    if (currentRow.components.length === 5) {
                        rows.push(currentRow);
                        currentRow = new ActionRowBuilder();
                    }

                    currentRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`poll_vote_${pollId}_${i}`)
                            .setLabel(POLL_EMOJIS[i])
                            .setStyle(ButtonStyle.Primary)
                    );
                }

                if (currentRow.components.length > 0) {
                    rows.push(currentRow);
                }

                // Add end poll button for creator/admins
                const controlRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`poll_end_${pollId}`)
                        .setLabel('End Poll')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🛑')
                );
                rows.push(controlRow);

                const message = await interaction.editReply({ embeds: [embed], components: rows });

                // Update poll with message ID
                await updatePollMessage(interaction.guildId, pollId, message.id);

                break;
            }

            case 'end': {
                await interaction.deferReply({ flags: 64 });

                const pollId = interaction.options.getString('poll_id');
                const poll = await getPoll(interaction.guildId, pollId);

                if (!poll) {
                    return interaction.editReply({
                        content: '❌ Poll not found!',
                    });
                }

                // Check if user is creator or has admin role
                const isCreator = poll.creator_id === interaction.user.id;
                const isAdmin = await hasMinimumRole(interaction.member, 'admin');

                if (!isCreator && !isAdmin) {
                    return interaction.editReply({
                        content: '❌ Only the poll creator or admins can end this poll!',
                    });
                }

                await endPoll(interaction.guildId, pollId);

                return interaction.editReply({
                    content: `✅ Poll \`${pollId}\` has been ended!`,
                });
            }

            case 'list': {
                await interaction.deferReply({ flags: 64 });

                const polls = await getActivePolls(interaction.guildId);

                if (polls.length === 0) {
                    return interaction.editReply({
                        content: '📊 No active polls in this server.',
                    });
                }

                const pollList = polls.map(p => {
                    const totalVotes = Object.values(p.options || {}).reduce((sum, opt) => sum + (opt.votes || 0), 0);
                    return `• **${p.question}**\n  ID: \`${p.id}\` | Votes: ${totalVotes}`;
                }).join('\n\n');

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('📊 Active Polls')
                    .setDescription(pollList)
                    .setFooter({ text: `${polls.length} active poll(s)` });

                return interaction.editReply({ embeds: [embed] });
            }
        }
    },
};
