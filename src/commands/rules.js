import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { saveGuildRules, getGuildRules, setRulesChannel, setVerifiedRole, loadGuildSettings, getGuildSettings } from '../utils/db-firebase.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('📜 Manage server rules')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Setup rules message in a channel')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to send rules message')
                        .setRequired(true))
                .addRoleOption(opt =>
                    opt.setName('verified_role')
                        .setDescription('Role to give when user agrees to rules')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a new rule')
                .addStringOption(opt =>
                    opt.setName('rule')
                        .setDescription('The rule text')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a rule by number')
                .addIntegerOption(opt =>
                    opt.setName('number')
                        .setDescription('Rule number to remove')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all current rules'))
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear all rules'))
        .addSubcommand(sub =>
            sub.setName('refresh')
                .setDescription('Refresh the rules message in channel')),

    adminOnly: true,

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                await interaction.deferReply({ flags: 64 });

                const channel = interaction.options.getChannel('channel');
                const verifiedRole = interaction.options.getRole('verified_role');

                // Get current rules
                const rulesData = await getGuildRules(interaction.guildId);
                const rules = rulesData?.rules || [];

                if (rules.length === 0) {
                    return interaction.editReply({
                        content: '❌ No rules have been set! Use `/rules add` to add rules first.',
                    });
                }

                // Save verified role if provided
                if (verifiedRole) {
                    await setVerifiedRole(interaction.guildId, verifiedRole.id);
                }

                // Create rules embed
                const rulesText = rules.map((rule, i) => `**${i + 1}.** ${rule}`).join('\n\n');

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('📜 Server Rules')
                    .setDescription(rulesText)
                    .setFooter({ text: 'Please read and agree to the rules to access the server' })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('rules_agree')
                        .setLabel('✅ I Agree to the Rules')
                        .setStyle(ButtonStyle.Success)
                );

                try {
                    const message = await channel.send({ embeds: [embed], components: [row] });
                    await setRulesChannel(interaction.guildId, channel.id, message.id);

                    return interaction.editReply({
                        content: `✅ Rules message sent to ${channel}!\n${verifiedRole ? `Users will receive ${verifiedRole} when they agree.` : 'No verified role set.'}`,
                    });
                } catch (error) {
                    console.error('Error sending rules message:', error);
                    return interaction.editReply({
                        content: '❌ Failed to send rules message. Make sure I have permission to send messages in that channel.',
                    });
                }
            }

            case 'add': {
                await interaction.deferReply({ flags: 64 });

                const newRule = interaction.options.getString('rule');
                const rulesData = await getGuildRules(interaction.guildId);
                const rules = rulesData?.rules || [];

                rules.push(newRule);
                await saveGuildRules(interaction.guildId, rules);

                return interaction.editReply({
                    content: `✅ Rule #${rules.length} added!\n>>> ${newRule}`,
                });
            }

            case 'remove': {
                await interaction.deferReply({ flags: 64 });

                const ruleNumber = interaction.options.getInteger('number');
                const rulesData = await getGuildRules(interaction.guildId);
                const rules = rulesData?.rules || [];

                if (ruleNumber > rules.length || ruleNumber < 1) {
                    return interaction.editReply({
                        content: `❌ Invalid rule number! You have ${rules.length} rules.`,
                    });
                }

                const removed = rules.splice(ruleNumber - 1, 1)[0];
                await saveGuildRules(interaction.guildId, rules);

                return interaction.editReply({
                    content: `✅ Rule #${ruleNumber} removed!\n>>> ${removed}`,
                });
            }

            case 'list': {
                await interaction.deferReply({ flags: 64 });

                const rulesData = await getGuildRules(interaction.guildId);
                const rules = rulesData?.rules || [];

                if (rules.length === 0) {
                    return interaction.editReply({
                        content: '📜 No rules have been set yet. Use `/rules add` to add rules.',
                    });
                }

                const rulesText = rules.map((rule, i) => `**${i + 1}.** ${rule}`).join('\n\n');

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('📜 Current Server Rules')
                    .setDescription(rulesText)
                    .setFooter({ text: `${rules.length} rule(s) total` });

                return interaction.editReply({ embeds: [embed] });
            }

            case 'clear': {
                await interaction.deferReply({ flags: 64 });

                await saveGuildRules(interaction.guildId, []);

                return interaction.editReply({
                    content: '✅ All rules have been cleared!',
                });
            }

            case 'refresh': {
                await interaction.deferReply({ flags: 64 });

                await loadGuildSettings(interaction.guildId);
                const settings = getGuildSettings(interaction.guildId);

                if (!settings?.rules_channel || !settings?.rules_message_id) {
                    return interaction.editReply({
                        content: '❌ No rules message has been set up. Use `/rules setup` first.',
                    });
                }

                const channel = interaction.guild.channels.cache.get(settings.rules_channel);
                if (!channel) {
                    return interaction.editReply({
                        content: '❌ Rules channel not found!',
                    });
                }

                try {
                    const message = await channel.messages.fetch(settings.rules_message_id);

                    const rulesData = await getGuildRules(interaction.guildId);
                    const rules = rulesData?.rules || [];

                    if (rules.length === 0) {
                        return interaction.editReply({
                            content: '❌ No rules to display!',
                        });
                    }

                    const rulesText = rules.map((rule, i) => `**${i + 1}.** ${rule}`).join('\n\n');

                    const embed = new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle('📜 Server Rules')
                        .setDescription(rulesText)
                        .setFooter({ text: 'Please read and agree to the rules to access the server' })
                        .setTimestamp();

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('rules_agree')
                            .setLabel('✅ I Agree to the Rules')
                            .setStyle(ButtonStyle.Success)
                    );

                    await message.edit({ embeds: [embed], components: [row] });

                    return interaction.editReply({
                        content: '✅ Rules message refreshed!',
                    });
                } catch (error) {
                    console.error('Error refreshing rules:', error);
                    return interaction.editReply({
                        content: '❌ Could not find the rules message. Use `/rules setup` to create a new one.',
                    });
                }
            }
        }
    },
};
