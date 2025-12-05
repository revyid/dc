import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { saveInviteLink, getGuildInvites, deleteInviteLink, getInviteByShortCode } from '../utils/db-firebase.js';

// Generate short code
const generateShortCode = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('🔗 Manage server invite links')
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a new shortened invite link')
                .addStringOption(opt =>
                    opt.setName('custom_code')
                        .setDescription('Custom short code (optional, 3-20 chars)')
                        .setMinLength(3)
                        .setMaxLength(20))
                .addIntegerOption(opt =>
                    opt.setName('max_age')
                        .setDescription('Invite expiration in hours (0 = never)')
                        .setMinValue(0)
                        .setMaxValue(168)) // Max 1 week
                .addIntegerOption(opt =>
                    opt.setName('max_uses')
                        .setDescription('Maximum number of uses (0 = unlimited)')
                        .setMinValue(0)
                        .setMaxValue(100)))
        .addSubcommand(sub =>
            sub.setName('bot')
                .setDescription('Get bot invite link'))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all saved invite links'))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a saved invite link')
                .addStringOption(opt =>
                    opt.setName('short_code')
                        .setDescription('Short code to delete')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('info')
                .setDescription('Get info about a short link')
                .addStringOption(opt =>
                    opt.setName('short_code')
                        .setDescription('Short code to lookup')
                        .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create': {
                await interaction.deferReply({ flags: 64 });

                const customCode = interaction.options.getString('custom_code');
                const maxAge = interaction.options.getInteger('max_age') ?? 0;
                const maxUses = interaction.options.getInteger('max_uses') ?? 0;

                // Generate or use custom short code
                let shortCode = customCode || generateShortCode();

                // Check if custom code already exists
                if (customCode) {
                    const existing = await getInviteByShortCode(customCode);
                    if (existing) {
                        return interaction.editReply({
                            content: `❌ Short code \`${customCode}\` is already in use!`,
                        });
                    }
                }

                try {
                    // Create Discord invite
                    const invite = await interaction.channel.createInvite({
                        maxAge: maxAge * 3600, // Convert to seconds
                        maxUses: maxUses,
                        unique: true,
                        reason: `Created by ${interaction.user.tag} via /invite command`,
                    });

                    // Calculate expiration
                    const expiresAt = maxAge > 0 ? new Date(Date.now() + maxAge * 3600 * 1000).toISOString() : null;

                    // Save to database
                    await saveInviteLink(
                        interaction.guildId,
                        invite.code,
                        shortCode,
                        interaction.user.id,
                        expiresAt
                    );

                    const embed = new EmbedBuilder()
                        .setColor(0x57f287)
                        .setTitle('🔗 Invite Link Created')
                        .setDescription(`Your shortened invite link has been created!`)
                        .addFields(
                            { name: 'Short Code', value: `\`${shortCode}\``, inline: true },
                            { name: 'Discord Invite', value: `https://discord.gg/${invite.code}`, inline: true },
                            { name: 'Max Uses', value: maxUses === 0 ? 'Unlimited' : String(maxUses), inline: true },
                            { name: 'Expires', value: maxAge === 0 ? 'Never' : `<t:${Math.floor((Date.now() + maxAge * 3600 * 1000) / 1000)}:R>`, inline: true }
                        )
                        .setFooter({ text: 'Configure your custom domain to redirect this short code' });

                    return interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    console.error('Error creating invite:', error);
                    return interaction.editReply({
                        content: '❌ Failed to create invite. Make sure I have the `Create Invite` permission!',
                    });
                }
            }

            case 'bot': {
                await interaction.deferReply({ flags: 64 });

                const clientId = client.user.id;
                const permissions = '8'; // Administrator
                const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('🤖 Bot Invite Link')
                    .setDescription(`[Click here to invite me to your server!](${inviteUrl})`)
                    .addFields(
                        { name: 'Direct Link', value: inviteUrl }
                    )
                    .setThumbnail(client.user.displayAvatarURL());

                return interaction.editReply({ embeds: [embed] });
            }

            case 'list': {
                await interaction.deferReply({ flags: 64 });

                const invites = await getGuildInvites(interaction.guildId);

                if (invites.length === 0) {
                    return interaction.editReply({
                        content: '🔗 No saved invite links. Use `/invite create` to create one!',
                    });
                }

                const inviteList = invites.map(inv => {
                    const expiry = inv.expires_at ? `<t:${Math.floor(new Date(inv.expires_at).getTime() / 1000)}:R>` : 'Never';
                    return `• **\`${inv.short_code}\`** → \`${inv.invite_code}\`\n  Uses: ${inv.uses || 0} | Expires: ${expiry}`;
                }).join('\n\n');

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('🔗 Saved Invite Links')
                    .setDescription(inviteList)
                    .setFooter({ text: `${invites.length} invite(s) saved` });

                return interaction.editReply({ embeds: [embed] });
            }

            case 'delete': {
                await interaction.deferReply({ flags: 64 });

                const shortCode = interaction.options.getString('short_code');

                const result = await deleteInviteLink(interaction.guildId, shortCode);

                if (result) {
                    return interaction.editReply({
                        content: `✅ Invite link \`${shortCode}\` deleted!`,
                    });
                } else {
                    return interaction.editReply({
                        content: `❌ Failed to delete invite link \`${shortCode}\`. It may not exist.`,
                    });
                }
            }

            case 'info': {
                await interaction.deferReply({ flags: 64 });

                const shortCode = interaction.options.getString('short_code');
                const invite = await getInviteByShortCode(shortCode);

                if (!invite) {
                    return interaction.editReply({
                        content: `❌ Short code \`${shortCode}\` not found!`,
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle(`🔗 Invite: ${shortCode}`)
                    .addFields(
                        { name: 'Short Code', value: `\`${shortCode}\``, inline: true },
                        { name: 'Discord Invite', value: invite.full_url, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(new Date(invite.created_at).getTime() / 1000)}:R>`, inline: true }
                    );

                return interaction.editReply({ embeds: [embed] });
            }
        }
    },
};
