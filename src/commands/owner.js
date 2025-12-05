import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActivityType } from 'discord.js';
import { isBotOwner, getOwnerOnlyMessage, BOT_OWNER_ID } from '../utils/ownerControl.js';
import { checkAllGuilds, redetectGuildRoles } from '../utils/databaseValidator.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bot settings stored in memory (can be moved to database later)
let botSettings = {
    maintenanceMode: false,
    maintenanceMessage: '🔧 Bot sedang dalam maintenance. Silakan coba lagi nanti.',
    customStatus: null,
    blacklistedUsers: new Set(),
    blacklistedGuilds: new Set(),
};

export default {
    data: new SlashCommandBuilder()
        .setName('owner')
        .setDescription('🔐 Bot owner control panel')
        // Stats & Info
        .addSubcommand(sub =>
            sub.setName('stats')
                .setDescription('View bot statistics'))
        .addSubcommand(sub =>
            sub.setName('guilds')
                .setDescription('List all guilds the bot is in'))
        .addSubcommand(sub =>
            sub.setName('guildinfo')
                .setDescription('Get detailed info about a guild')
                .addStringOption(opt =>
                    opt.setName('guild_id')
                        .setDescription('Guild ID')
                        .setRequired(true)))
        // Bot Control
        .addSubcommand(sub =>
            sub.setName('restart')
                .setDescription('Restart the bot'))
        .addSubcommand(sub =>
            sub.setName('shutdown')
                .setDescription('Shutdown the bot'))
        .addSubcommand(sub =>
            sub.setName('reload')
                .setDescription('Reload database for all guilds'))
        // Bot Settings
        .addSubcommand(sub =>
            sub.setName('maintenance')
                .setDescription('Toggle maintenance mode')
                .addBooleanOption(opt =>
                    opt.setName('enabled')
                        .setDescription('Enable or disable maintenance mode')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Custom maintenance message')))
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Change bot status')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Activity type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Playing', value: 'playing' },
                            { name: 'Watching', value: 'watching' },
                            { name: 'Listening', value: 'listening' },
                            { name: 'Competing', value: 'competing' },
                            { name: 'Streaming', value: 'streaming' },
                            { name: 'Custom', value: 'custom' }
                        ))
                .addStringOption(opt =>
                    opt.setName('text')
                        .setDescription('Status text')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('presence')
                        .setDescription('Online status')
                        .addChoices(
                            { name: 'Online', value: 'online' },
                            { name: 'Idle', value: 'idle' },
                            { name: 'Do Not Disturb', value: 'dnd' },
                            { name: 'Invisible', value: 'invisible' }
                        )))
        .addSubcommand(sub =>
            sub.setName('nickname')
                .setDescription('Change bot nickname in a guild')
                .addStringOption(opt =>
                    opt.setName('nickname')
                        .setDescription('New nickname (empty to reset)')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('guild_id')
                        .setDescription('Guild ID (current if empty)')))
        .addSubcommand(sub =>
            sub.setName('avatar')
                .setDescription('Change bot avatar')
                .addStringOption(opt =>
                    opt.setName('url')
                        .setDescription('Image URL')
                        .setRequired(true)))
        // Communication
        .addSubcommand(sub =>
            sub.setName('broadcast')
                .setDescription('Broadcast message to all guilds')
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Message to broadcast')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('dm')
                .setDescription('Send DM to a user')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('User to DM')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Message to send')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('say')
                .setDescription('Send message as bot')
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Message to send')
                        .setRequired(true))
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to send to (current if empty)')))
        // Guild Management
        .addSubcommand(sub =>
            sub.setName('leave')
                .setDescription('Leave a specific guild')
                .addStringOption(opt =>
                    opt.setName('guild_id')
                        .setDescription('Guild ID to leave')
                        .setRequired(true)))
        // Blacklist
        .addSubcommand(sub =>
            sub.setName('blacklist')
                .setDescription('Manage user/guild blacklist')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('Action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add User', value: 'add_user' },
                            { name: 'Remove User', value: 'remove_user' },
                            { name: 'Add Guild', value: 'add_guild' },
                            { name: 'Remove Guild', value: 'remove_guild' },
                            { name: 'List', value: 'list' }
                        ))
                .addStringOption(opt =>
                    opt.setName('id')
                        .setDescription('User or Guild ID')))
        // Dev Tools
        .addSubcommand(sub =>
            sub.setName('eval')
                .setDescription('Execute JavaScript code (DANGEROUS)')
                .addStringOption(opt =>
                    opt.setName('code')
                        .setDescription('Code to execute')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('exec')
                .setDescription('Execute shell command')
                .addStringOption(opt =>
                    opt.setName('command')
                        .setDescription('Command to execute')
                        .setRequired(true))),

    ownerOnly: true,
    botSettings, // Export settings for other files to access

    async execute(interaction, client) {
        // Check if user is bot owner
        if (!isBotOwner(interaction.user.id)) {
            return interaction.reply({
                content: getOwnerOnlyMessage(),
                flags: 64
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            // ==================== STATS & INFO ====================
            case 'stats': {
                await interaction.deferReply({ flags: 64 });

                const totalGuilds = client.guilds.cache.size;
                const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
                const totalChannels = client.channels.cache.size;
                const uptime = formatUptime(client.uptime);
                const memUsage = process.memoryUsage();
                const cpuUsage = process.cpuUsage();

                const embed = new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle('🔐 Bot Owner Dashboard')
                    .setThumbnail(client.user.displayAvatarURL())
                    .addFields(
                        { name: '🏠 Servers', value: `${totalGuilds}`, inline: true },
                        { name: '👥 Users', value: `${totalUsers.toLocaleString()}`, inline: true },
                        { name: '📺 Channels', value: `${totalChannels}`, inline: true },
                        { name: '⏱️ Uptime', value: uptime, inline: true },
                        { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
                        { name: '🔧 Maintenance', value: botSettings.maintenanceMode ? '🔴 ON' : '🟢 OFF', inline: true },
                        { name: '💾 Memory', value: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, inline: true },
                        { name: '📦 Node.js', value: process.version, inline: true },
                        { name: '🚫 Blacklisted', value: `Users: ${botSettings.blacklistedUsers.size} | Guilds: ${botSettings.blacklistedGuilds.size}`, inline: true }
                    )
                    .setFooter({ text: `Bot ID: ${client.user.id}` })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            case 'guilds': {
                await interaction.deferReply({ flags: 64 });

                const sortedGuilds = [...client.guilds.cache.values()]
                    .sort((a, b) => b.memberCount - a.memberCount);

                const guilds = sortedGuilds.slice(0, 20).map((g, i) =>
                    `**${i + 1}.** ${g.name}\n   └ ID: \`${g.id}\` | 👥 ${g.memberCount}`
                );

                const embed = new EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle(`🏠 Bot Guilds (${client.guilds.cache.size})`)
                    .setDescription(guilds.join('\n\n') || 'No guilds')
                    .setFooter({ text: 'Showing top 20 by member count' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            case 'guildinfo': {
                await interaction.deferReply({ flags: 64 });

                const guildId = interaction.options.getString('guild_id');
                const guild = client.guilds.cache.get(guildId);

                if (!guild) {
                    return interaction.editReply({ content: '❌ Guild not found!' });
                }

                const owner = await guild.fetchOwner().catch(() => null);
                const channels = guild.channels.cache;
                const roles = guild.roles.cache;

                const embed = new EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle(`🏠 ${guild.name}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .addFields(
                        { name: 'ID', value: guild.id, inline: true },
                        { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
                        { name: 'Members', value: `${guild.memberCount}`, inline: true },
                        { name: 'Channels', value: `${channels.size}`, inline: true },
                        { name: 'Roles', value: `${roles.size}`, inline: true },
                        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // ==================== BOT CONTROL ====================
            case 'restart': {
                await interaction.reply({
                    content: '🔄 Restarting bot...',
                    flags: 64
                });

                console.log(`\n🔄 Bot restart requested by owner (${interaction.user.tag})`);

                // Destroy current connection
                client.destroy();

                // Spawn new process and exit current
                const scriptPath = join(__dirname, '..', 'index.js');
                const child = spawn('node', [scriptPath], {
                    detached: true,
                    stdio: 'ignore'
                });
                child.unref();

                setTimeout(() => {
                    process.exit(0);
                }, 1000);
                break;
            }

            case 'shutdown': {
                await interaction.reply({
                    content: '⚠️ Shutting down bot...',
                    flags: 64
                });

                console.log(`\n⚠️ Bot shutdown requested by owner (${interaction.user.tag})`);

                setTimeout(() => {
                    client.destroy();
                    process.exit(0);
                }, 1000);
                break;
            }

            case 'reload': {
                await interaction.deferReply({ flags: 64 });

                try {
                    const result = await checkAllGuilds(client);
                    return interaction.editReply({
                        content: `✅ Database reload complete!\n• Total: ${result.totalGuilds}\n• Valid: ${result.validGuilds}\n• Repaired: ${result.repairedGuilds}\n• Failed: ${result.failedGuilds}`
                    });
                } catch (error) {
                    return interaction.editReply({
                        content: `❌ Error: ${error.message}`
                    });
                }
            }

            // ==================== BOT SETTINGS ====================
            case 'maintenance': {
                const enabled = interaction.options.getBoolean('enabled');
                const message = interaction.options.getString('message');

                botSettings.maintenanceMode = enabled;
                if (message) botSettings.maintenanceMessage = message;

                // Update bot status to reflect maintenance
                if (enabled) {
                    client.user.setPresence({
                        activities: [{ name: '🔧 Maintenance Mode', type: ActivityType.Custom }],
                        status: 'dnd'
                    });
                } else {
                    client.user.setPresence({
                        activities: [{ name: '/help untuk bantuan', type: ActivityType.Listening }],
                        status: 'online'
                    });
                }

                return interaction.reply({
                    content: `${enabled ? '🔴' : '🟢'} Maintenance mode ${enabled ? 'enabled' : 'disabled'}!${message ? `\nMessage: ${message}` : ''}`,
                    flags: 64
                });
            }

            case 'status': {
                const type = interaction.options.getString('type');
                const text = interaction.options.getString('text');
                const presence = interaction.options.getString('presence') || 'online';

                const activityTypes = {
                    playing: ActivityType.Playing,
                    watching: ActivityType.Watching,
                    listening: ActivityType.Listening,
                    competing: ActivityType.Competing,
                    streaming: ActivityType.Streaming,
                    custom: ActivityType.Custom
                };

                client.user.setPresence({
                    activities: [{ name: text, type: activityTypes[type] }],
                    status: presence
                });

                botSettings.customStatus = { type, text, presence };

                return interaction.reply({
                    content: `✅ Status updated!\n• Type: ${type}\n• Text: ${text}\n• Presence: ${presence}`,
                    flags: 64
                });
            }

            case 'nickname': {
                const nickname = interaction.options.getString('nickname') || null;
                const guildId = interaction.options.getString('guild_id') || interaction.guildId;

                const guild = client.guilds.cache.get(guildId);
                if (!guild) {
                    return interaction.reply({ content: '❌ Guild not found!', flags: 64 });
                }

                try {
                    await guild.members.me.setNickname(nickname);
                    return interaction.reply({
                        content: `✅ Nickname ${nickname ? `changed to **${nickname}**` : 'reset'} in **${guild.name}**`,
                        flags: 64
                    });
                } catch (error) {
                    return interaction.reply({
                        content: `❌ Failed: ${error.message}`,
                        flags: 64
                    });
                }
            }

            case 'avatar': {
                const url = interaction.options.getString('url');

                try {
                    await client.user.setAvatar(url);
                    return interaction.reply({
                        content: '✅ Avatar updated!',
                        flags: 64
                    });
                } catch (error) {
                    return interaction.reply({
                        content: `❌ Failed: ${error.message}`,
                        flags: 64
                    });
                }
            }

            // ==================== COMMUNICATION ====================
            case 'broadcast': {
                await interaction.deferReply({ flags: 64 });

                const message = interaction.options.getString('message');
                let successCount = 0;
                let failCount = 0;

                for (const [, guild] of client.guilds.cache) {
                    try {
                        const channel = guild.systemChannel ||
                            guild.channels.cache.find(ch =>
                                ch.isTextBased() && ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
                            );

                        if (channel) {
                            await channel.send({
                                embeds: [{
                                    color: 0xf1c40f,
                                    title: '📢 Announcement from Bot Owner',
                                    description: message,
                                    footer: { text: 'Bot System Announcement' },
                                    timestamp: new Date().toISOString()
                                }]
                            });
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        failCount++;
                    }
                }

                return interaction.editReply({
                    content: `✅ Broadcast complete!\n• Success: ${successCount}\n• Failed: ${failCount}`
                });
            }

            case 'dm': {
                const user = interaction.options.getUser('user');
                const message = interaction.options.getString('message');

                try {
                    await user.send({
                        embeds: [{
                            color: 0x9b59b6,
                            title: '📬 Message from Bot Owner',
                            description: message,
                            footer: { text: 'Reply to this message to respond' },
                            timestamp: new Date().toISOString()
                        }]
                    });

                    return interaction.reply({
                        content: `✅ DM sent to **${user.tag}**!`,
                        flags: 64
                    });
                } catch (error) {
                    return interaction.reply({
                        content: `❌ Failed to send DM: ${error.message}`,
                        flags: 64
                    });
                }
            }

            case 'say': {
                const message = interaction.options.getString('message');
                const channel = interaction.options.getChannel('channel') || interaction.channel;

                try {
                    await channel.send(message);
                    return interaction.reply({
                        content: `✅ Message sent to ${channel}`,
                        flags: 64
                    });
                } catch (error) {
                    return interaction.reply({
                        content: `❌ Failed: ${error.message}`,
                        flags: 64
                    });
                }
            }

            // ==================== GUILD MANAGEMENT ====================
            case 'leave': {
                const guildId = interaction.options.getString('guild_id');
                const guild = client.guilds.cache.get(guildId);

                if (!guild) {
                    return interaction.reply({
                        content: '❌ Guild not found!',
                        flags: 64
                    });
                }

                const guildName = guild.name;
                await guild.leave();

                return interaction.reply({
                    content: `✅ Left guild: **${guildName}** (${guildId})`,
                    flags: 64
                });
            }

            // ==================== BLACKLIST ====================
            case 'blacklist': {
                const action = interaction.options.getString('action');
                const id = interaction.options.getString('id');

                switch (action) {
                    case 'add_user':
                        if (!id) return interaction.reply({ content: '❌ Please provide a user ID', flags: 64 });
                        botSettings.blacklistedUsers.add(id);
                        return interaction.reply({ content: `✅ User \`${id}\` added to blacklist`, flags: 64 });

                    case 'remove_user':
                        if (!id) return interaction.reply({ content: '❌ Please provide a user ID', flags: 64 });
                        botSettings.blacklistedUsers.delete(id);
                        return interaction.reply({ content: `✅ User \`${id}\` removed from blacklist`, flags: 64 });

                    case 'add_guild':
                        if (!id) return interaction.reply({ content: '❌ Please provide a guild ID', flags: 64 });
                        botSettings.blacklistedGuilds.add(id);
                        return interaction.reply({ content: `✅ Guild \`${id}\` added to blacklist`, flags: 64 });

                    case 'remove_guild':
                        if (!id) return interaction.reply({ content: '❌ Please provide a guild ID', flags: 64 });
                        botSettings.blacklistedGuilds.delete(id);
                        return interaction.reply({ content: `✅ Guild \`${id}\` removed from blacklist`, flags: 64 });

                    case 'list': {
                        const users = [...botSettings.blacklistedUsers].join(', ') || 'None';
                        const guilds = [...botSettings.blacklistedGuilds].join(', ') || 'None';

                        const embed = new EmbedBuilder()
                            .setColor(0xe74c3c)
                            .setTitle('🚫 Blacklist')
                            .addFields(
                                { name: 'Users', value: users },
                                { name: 'Guilds', value: guilds }
                            );

                        return interaction.reply({ embeds: [embed], flags: 64 });
                    }
                }
                break;
            }

            // ==================== DEV TOOLS ====================
            case 'eval': {
                const code = interaction.options.getString('code');

                try {
                    const cleanCode = code.replace(/```(js|javascript)?/g, '').trim();
                    let result = eval(cleanCode);

                    if (result instanceof Promise) {
                        result = await result;
                    }

                    let output = typeof result === 'string' ? result : require('util').inspect(result, { depth: 2 });

                    if (output.length > 1900) {
                        output = output.substring(0, 1900) + '...';
                    }

                    return interaction.reply({
                        content: `✅ **Output:**\n\`\`\`js\n${output}\n\`\`\``,
                        flags: 64
                    });
                } catch (error) {
                    return interaction.reply({
                        content: `❌ **Error:**\n\`\`\`js\n${error.message}\n\`\`\``,
                        flags: 64
                    });
                }
            }

            case 'exec': {
                await interaction.deferReply({ flags: 64 });

                const command = interaction.options.getString('command');

                try {
                    const { exec } = await import('child_process');
                    const { promisify } = await import('util');
                    const execAsync = promisify(exec);

                    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
                    let output = stdout || stderr || 'No output';

                    if (output.length > 1900) {
                        output = output.substring(0, 1900) + '...';
                    }

                    return interaction.editReply({
                        content: `**$ ${command}**\n\`\`\`\n${output}\n\`\`\``
                    });
                } catch (error) {
                    return interaction.editReply({
                        content: `❌ **Error:**\n\`\`\`\n${error.message}\n\`\`\``
                    });
                }
            }
        }
    }
};

// Export bot settings for access from other files
export { botSettings };

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
}

