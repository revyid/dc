import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getQueue, createQueue, deleteQueue, joinChannel, searchSong } from '../utils/musicPlayer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 Play music from YouTube in voice channel')
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Play a song from YouTube')
                .addStringOption(opt =>
                    opt.setName('query')
                        .setDescription('YouTube URL or search query')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('skip')
                .setDescription('Skip the current song'))
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Stop playing and clear the queue'))
        .addSubcommand(sub =>
            sub.setName('pause')
                .setDescription('Pause the current song'))
        .addSubcommand(sub =>
            sub.setName('resume')
                .setDescription('Resume the paused song'))
        .addSubcommand(sub =>
            sub.setName('queue')
                .setDescription('Show the current queue'))
        .addSubcommand(sub =>
            sub.setName('nowplaying')
                .setDescription('Show the currently playing song'))
        .addSubcommand(sub =>
            sub.setName('shuffle')
                .setDescription('Shuffle the queue'))
        .addSubcommand(sub =>
            sub.setName('loop')
                .setDescription('Toggle loop mode')
                .addStringOption(opt =>
                    opt.setName('mode')
                        .setDescription('Loop mode')
                        .addChoices(
                            { name: 'Off', value: 'off' },
                            { name: 'Song', value: 'song' },
                            { name: 'Queue', value: 'queue' }
                        )))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a song from the queue')
                .addIntegerOption(opt =>
                    opt.setName('position')
                        .setDescription('Position in queue (1-based)')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear the queue but keep playing current song'))
        .addSubcommand(sub =>
            sub.setName('disconnect')
                .setDescription('Disconnect from voice channel')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        // Fetch member to get updated voice state
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => interaction.member);
        const memberVoice = member.voice;

        // Check if user is in a voice channel (for most commands)
        if (!memberVoice?.channel && subcommand !== 'queue' && subcommand !== 'nowplaying') {
            return interaction.reply({
                content: '❌ Kamu harus berada di voice channel terlebih dahulu!',
                flags: 64,
            });
        }

        switch (subcommand) {
            case 'play': {
                await interaction.deferReply();

                const query = interaction.options.getString('query');

                // Search for the song
                const song = await searchSong(query, interaction.user.id);

                if (!song) {
                    return interaction.editReply({
                        content: '❌ Tidak dapat menemukan lagu. Coba query lain atau pastikan URL valid.',
                    });
                }

                // Get or create queue
                let queue = getQueue(guildId);

                if (!queue) {
                    queue = createQueue(guildId);

                    // Check bot permissions
                    const permissions = memberVoice.channel.permissionsFor(interaction.guild.members.me);
                    if (!permissions?.has('Connect') || !permissions?.has('Speak')) {
                        deleteQueue(guildId);
                        return interaction.editReply({
                            content: '❌ Bot tidak memiliki izin untuk bergabung atau berbicara di voice channel!',
                        });
                    }

                    // Join voice channel
                    try {
                        queue.connection = await joinChannel(memberVoice.channel, interaction.channel);
                        queue.textChannel = interaction.channel;
                    } catch (error) {
                        console.error('Failed to join voice channel:', error);
                        deleteQueue(guildId);
                        return interaction.editReply({
                            content: `❌ Gagal bergabung ke voice channel! Error: ${error.message || 'Unknown error'}`,
                        });
                    }
                }

                // Check if bot is in a different voice channel
                const botVoice = interaction.guild.members.me.voice;
                if (botVoice.channel && botVoice.channel.id !== memberVoice.channel.id) {
                    return interaction.editReply({
                        content: '❌ Bot sedang digunakan di voice channel lain!',
                    });
                }

                // Add song to queue
                const position = queue.addSong(song);

                // If this is the first/only song and not currently playing, start playing
                if (!queue.playing) {
                    const firstSong = queue.songs.shift();
                    await queue.playSong(firstSong);

                    return interaction.editReply({
                        embeds: [{
                            color: 0x57f287,
                            title: '🎵 Mulai Memutar',
                            description: `**[${song.title}](${song.url})**`,
                            fields: [
                                { name: 'Durasi', value: song.duration, inline: true },
                            ],
                            thumbnail: song.thumbnail ? { url: song.thumbnail } : undefined,
                        }],
                    });
                } else {
                    // Add to queue
                    const embed = new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle('✅ Ditambahkan ke Antrian')
                        .setDescription(`**[${song.title}](${song.url})**`)
                        .addFields(
                            { name: 'Durasi', value: song.duration, inline: true },
                            { name: 'Posisi', value: `#${position}`, inline: true },
                        );

                    if (song.thumbnail) {
                        embed.setThumbnail(song.thumbnail);
                    }

                    // Handle playlist
                    if (song.isPlaylist && song.playlistSongs) {
                        for (const s of song.playlistSongs) {
                            queue.addSong(s);
                        }
                        embed.setFooter({ text: `+${song.playlistSongs.length} lagu lainnya dari playlist "${song.playlistName}"` });
                    }

                    return interaction.editReply({ embeds: [embed] });
                }
            }

            case 'skip': {
                const queue = getQueue(guildId);

                if (!queue || !queue.playing) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                const skippedSong = queue.currentSong;
                queue.skip();

                return interaction.reply({
                    embeds: [{
                        color: 0xf1c40f,
                        title: '⏭️ Lagu Dilewati',
                        description: `**${skippedSong?.title || 'Unknown'}**`,
                    }],
                });
            }

            case 'stop': {
                const queue = getQueue(guildId);

                if (!queue) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                queue.stop();
                queue.disconnect();

                return interaction.reply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '⏹️ Musik Dihentikan',
                        description: 'Antrian dibersihkan dan bot keluar dari voice channel.',
                    }],
                });
            }

            case 'pause': {
                const queue = getQueue(guildId);

                if (!queue || !queue.playing) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                queue.pause();

                return interaction.reply({
                    embeds: [{
                        color: 0xf39c12,
                        title: '⏸️ Musik Dijeda',
                        description: `**${queue.currentSong?.title || 'Unknown'}**\n\nGunakan \`/music resume\` untuk melanjutkan.`,
                    }],
                });
            }

            case 'resume': {
                const queue = getQueue(guildId);

                if (!queue) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                queue.resume();

                return interaction.reply({
                    embeds: [{
                        color: 0x2ecc71,
                        title: '▶️ Musik Dilanjutkan',
                        description: `**${queue.currentSong?.title || 'Unknown'}**`,
                    }],
                });
            }

            case 'queue': {
                const queue = getQueue(guildId);

                if (!queue || (!queue.playing && queue.songs.length === 0)) {
                    return interaction.reply({
                        content: '📭 Antrian kosong! Gunakan `/music play` untuk menambahkan lagu.',
                        flags: 64,
                    });
                }

                const currentSong = queue.currentSong;
                const songs = queue.songs.slice(0, 10);

                let description = '';

                if (currentSong) {
                    description += `**🎵 Sedang Diputar:**\n[${currentSong.title}](${currentSong.url}) - ${currentSong.duration}\n\n`;
                }

                if (songs.length > 0) {
                    description += '**📋 Antrian:**\n';
                    songs.forEach((song, index) => {
                        description += `\`${index + 1}.\` [${song.title}](${song.url}) - ${song.duration}\n`;
                    });

                    if (queue.songs.length > 10) {
                        description += `\n*...dan ${queue.songs.length - 10} lagu lainnya*`;
                    }
                } else {
                    description += '*Tidak ada lagu dalam antrian*';
                }

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('🎶 Antrian Musik')
                    .setDescription(description)
                    .addFields(
                        { name: 'Total Antrian', value: `${queue.songs.length} lagu`, inline: true },
                        { name: 'Loop', value: queue.loop ? '🔂 Lagu' : queue.loopQueue ? '🔁 Antrian' : '❌ Off', inline: true },
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'nowplaying': {
                const queue = getQueue(guildId);

                if (!queue || !queue.currentSong) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                const song = queue.currentSong;

                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle('🎵 Sedang Diputar')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .addFields(
                        { name: 'Durasi', value: song.duration, inline: true },
                        { name: 'Diminta oleh', value: `<@${song.requestedBy}>`, inline: true },
                        { name: 'Antrian', value: `${queue.songs.length} lagu`, inline: true },
                    );

                if (song.thumbnail) {
                    embed.setThumbnail(song.thumbnail);
                }

                return interaction.reply({ embeds: [embed] });
            }

            case 'shuffle': {
                const queue = getQueue(guildId);

                if (!queue || queue.songs.length < 2) {
                    return interaction.reply({
                        content: '❌ Tidak cukup lagu dalam antrian untuk di-shuffle!',
                        flags: 64,
                    });
                }

                queue.shuffle();

                return interaction.reply({
                    embeds: [{
                        color: 0x9b59b6,
                        title: '🔀 Antrian Diacak',
                        description: `${queue.songs.length} lagu telah diacak.`,
                    }],
                });
            }

            case 'loop': {
                const queue = getQueue(guildId);

                if (!queue) {
                    return interaction.reply({
                        content: '❌ Tidak ada lagu yang sedang diputar!',
                        flags: 64,
                    });
                }

                const mode = interaction.options.getString('mode') || 'toggle';

                if (mode === 'off') {
                    queue.loop = false;
                    queue.loopQueue = false;
                } else if (mode === 'song') {
                    queue.loop = true;
                    queue.loopQueue = false;
                } else if (mode === 'queue') {
                    queue.loop = false;
                    queue.loopQueue = true;
                } else {
                    // Toggle through modes
                    if (!queue.loop && !queue.loopQueue) {
                        queue.loop = true;
                    } else if (queue.loop) {
                        queue.loop = false;
                        queue.loopQueue = true;
                    } else {
                        queue.loopQueue = false;
                    }
                }

                const status = queue.loop ? '🔂 Loop Lagu' : queue.loopQueue ? '🔁 Loop Antrian' : '❌ Loop Off';

                return interaction.reply({
                    embeds: [{
                        color: 0x3498db,
                        title: '🔄 Mode Loop',
                        description: status,
                    }],
                });
            }

            case 'remove': {
                const queue = getQueue(guildId);

                if (!queue || queue.songs.length === 0) {
                    return interaction.reply({
                        content: '❌ Antrian kosong!',
                        flags: 64,
                    });
                }

                const position = interaction.options.getInteger('position');
                const removed = queue.remove(position - 1);

                if (!removed) {
                    return interaction.reply({
                        content: '❌ Posisi tidak valid!',
                        flags: 64,
                    });
                }

                return interaction.reply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '🗑️ Lagu Dihapus',
                        description: `**${removed.title}** dihapus dari antrian.`,
                    }],
                });
            }

            case 'clear': {
                const queue = getQueue(guildId);

                if (!queue) {
                    return interaction.reply({
                        content: '❌ Tidak ada musik yang sedang diputar!',
                        flags: 64,
                    });
                }

                const count = queue.songs.length;
                queue.clear();

                return interaction.reply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '🗑️ Antrian Dibersihkan',
                        description: `${count} lagu dihapus dari antrian.`,
                    }],
                });
            }

            case 'disconnect': {
                const queue = getQueue(guildId);

                if (!queue) {
                    return interaction.reply({
                        content: '❌ Bot tidak terhubung ke voice channel!',
                        flags: 64,
                    });
                }

                queue.disconnect();

                return interaction.reply({
                    embeds: [{
                        color: 0x95a5a6,
                        title: '👋 Terputus',
                        description: 'Bot keluar dari voice channel.',
                    }],
                });
            }
        }
    },
};
