import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} from '@discordjs/voice';
import { spawn } from 'child_process';
import path from 'path';
import { createRequire } from 'module';
import play from 'play-dl'; // Keep for search only

const require = createRequire(import.meta.url);
// Resolve yt-dlp binary path dynamically
const ytDlpPath = path.join(path.dirname(require.resolve('youtube-dl-exec/package.json')), 'bin', 'yt-dlp.exe');

// Store queues per guild
const queues = new Map();

/**
 * Music Queue class for managing per-guild music playback
 */
class MusicQueue {
    constructor(guildId) {
        this.guildId = guildId;
        this.songs = [];
        this.currentSong = null;
        this.player = createAudioPlayer();
        this.connection = null;
        this.volume = 100;
        this.loop = false;
        this.loopQueue = false;
        this.playing = false;
        this.textChannel = null;

        // Handle player state changes
        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log('[Music] Player state: IDLE');
            this.handleSongEnd();
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('[Music] Player state: PLAYING ✓');
        });

        this.player.on(AudioPlayerStatus.Buffering, () => {
            console.log('[Music] Player state: BUFFERING...');
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            console.log('[Music] Player state: PAUSED');
        });

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('[Music] Player state: AUTO-PAUSED (no subscribers!)');
        });

        this.player.on('error', (error) => {
            console.error('[Music] Audio player error:', error);
            this.handleSongEnd();
        });
    }

    async handleSongEnd() {
        // If loop is enabled, replay the same song
        if (this.loop && this.currentSong) {
            await this.playSong(this.currentSong);
            return;
        }

        // If loop queue is enabled, add current song back to end
        if (this.loopQueue && this.currentSong) {
            this.songs.push(this.currentSong);
        }

        // Play next song
        if (this.songs.length > 0) {
            const nextSong = this.songs.shift();
            await this.playSong(nextSong);
        } else {
            this.currentSong = null;
            this.playing = false;

            // Disconnect after 5 minutes of inactivity
            setTimeout(() => {
                if (!this.playing && this.songs.length === 0) {
                    this.disconnect();
                }
            }, 5 * 60 * 1000);
        }
    }

    async playSong(song) {
        try {
            this.currentSong = song;
            this.playing = true;

            console.log(`[Music] Playing: ${song.title}`);
            console.log(`[Music] URL: ${song.url}`);
            console.log(`[Music] yt-dlp path: ${ytDlpPath}`);

            // Use child_process.spawn for direct streaming without buffering
            const process = spawn(
                ytDlpPath,
                [
                    song.url,
                    '--output', '-',
                    '--format', 'bestaudio',
                    '--limit-rate', '1M',
                    '--rm-cache-dir',
                    '--no-playlist',
                    '--quiet', // Reduce logs to stdout (we only want audio data)
                ],
                { stdio: ['ignore', 'pipe', 'ignore'] }
            );

            console.log('[Music] Stream created with spawn(yt-dlp)');
            const stream = process.stdout;

            // Handle process errors
            process.on('error', (err) => {
                console.error('[Music] yt-dlp process error:', err);
                if (!this.playing) this.handleSongEnd();
            });

            // Check if process exits prematurely
            process.on('close', (code) => {
                if (code !== 0 && code !== null) {
                    console.error(`[Music] yt-dlp process exited with code ${code}`);
                }
            });

            const resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
            });

            // Set volume
            resource.volume?.setVolume(this.volume / 100);

            // Subscribe connection to player FIRST
            if (this.connection) {
                this.connection.subscribe(this.player);
                console.log('[Music] Player subscribed to connection');
            } else {
                console.error('[Music] No connection available!');
                return false;
            }

            // Start playing
            this.player.play(resource);
            console.log('[Music] Player started');

            return true;
        } catch (error) {
            console.error('[Music] Error playing song:', error);

            // Send error message to channel
            if (this.textChannel) {
                this.textChannel.send({
                    content: `❌ Gagal memutar **${song.title}**: ${error.message}`,
                }).catch(() => { });
            }

            this.handleSongEnd();
            return false;
        }
    }

    addSong(song) {
        this.songs.push(song);
        return this.songs.length;
    }

    skip() {
        this.player.stop();
    }

    stop() {
        this.songs = [];
        this.loop = false;
        this.loopQueue = false;
        this.player.stop();
    }

    pause() {
        this.player.pause();
    }

    resume() {
        this.player.unpause();
    }

    shuffle() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }

    remove(index) {
        if (index >= 0 && index < this.songs.length) {
            return this.songs.splice(index, 1)[0];
        }
        return null;
    }

    clear() {
        this.songs = [];
    }

    disconnect() {
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
        this.playing = false;
        this.currentSong = null;
        queues.delete(this.guildId);
    }
}

/**
 * Get or create queue for a guild
 */
export function getQueue(guildId) {
    return queues.get(guildId);
}

/**
 * Create a new queue for a guild
 */
export function createQueue(guildId) {
    const queue = new MusicQueue(guildId);
    queues.set(guildId, queue);
    return queue;
}

/**
 * Delete queue for a guild
 */
export function deleteQueue(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        queue.disconnect();
    }
    queues.delete(guildId);
}

/**
 * Join a voice channel
 */
export async function joinChannel(channel, textChannel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true, // Bot doesn't need to hear
            selfMute: false,
        });

        // Handle connection state changes
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                // Try to reconnect
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel
            } catch (error) {
                // Seems to be a real disconnect
                connection.destroy();
            }
        });

        // Wait for connection to be ready
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        return connection;
    } catch (error) {
        console.error('Failed to join voice channel:', error);
        throw error;
    }
}

/**
 * Search for a song on YouTube
 */
export async function searchSong(query, requestedBy) {
    try {
        // Check if it's a URL
        const isUrl = query.startsWith('http://') || query.startsWith('https://');

        let songInfo;

        if (isUrl) {
            const validateResult = play.yt_validate(query);
            console.log(`URL validation result for "${query}": ${validateResult}`);

            // Get info from URL
            if (validateResult === 'video') {
                try {
                    const info = await play.video_info(query);
                    songInfo = {
                        title: info.video_details.title,
                        url: info.video_details.url,
                        duration: formatDuration(info.video_details.durationInSec),
                        thumbnail: info.video_details.thumbnails[0]?.url,
                        requestedBy,
                    };
                } catch (urlError) {
                    console.error('Error fetching video info, falling back to search:', urlError);
                    // Fall back to search
                    const searchResults = await play.search(query, { limit: 1 });
                    if (searchResults.length > 0) {
                        const video = searchResults[0];
                        songInfo = {
                            title: video.title,
                            url: video.url,
                            duration: formatDuration(video.durationInSec),
                            thumbnail: video.thumbnails[0]?.url,
                            requestedBy,
                        };
                    }
                }
            } else if (validateResult === 'playlist') {
                // Handle playlist - return first song for now
                const playlist = await play.playlist_info(query, { incomplete: true });
                const videos = await playlist.all_videos();
                if (videos.length > 0) {
                    const firstVideo = videos[0];
                    songInfo = {
                        title: firstVideo.title,
                        url: firstVideo.url,
                        duration: formatDuration(firstVideo.durationInSec),
                        thumbnail: firstVideo.thumbnails[0]?.url,
                        requestedBy,
                        isPlaylist: true,
                        playlistName: playlist.title,
                        playlistSongs: videos.slice(1).map(v => ({
                            title: v.title,
                            url: v.url,
                            duration: formatDuration(v.durationInSec),
                            thumbnail: v.thumbnails[0]?.url,
                            requestedBy,
                        })),
                    };
                }
            } else {
                // URL not recognized, try searching with it
                console.log('URL not recognized as video/playlist, searching...');
                const searchResults = await play.search(query, { limit: 1 });
                if (searchResults.length > 0) {
                    const video = searchResults[0];
                    songInfo = {
                        title: video.title,
                        url: video.url,
                        duration: formatDuration(video.durationInSec),
                        thumbnail: video.thumbnails[0]?.url,
                        requestedBy,
                    };
                }
            }
        } else {
            // Search for the query
            const searchResults = await play.search(query, { limit: 1 });
            if (searchResults.length > 0) {
                const video = searchResults[0];
                songInfo = {
                    title: video.title,
                    url: video.url,
                    duration: formatDuration(video.durationInSec),
                    thumbnail: video.thumbnails[0]?.url,
                    requestedBy,
                };
            }
        }

        return songInfo || null;
    } catch (error) {
        console.error('Error searching song:', error);
        return null;
    }
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds) {
    if (!seconds) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get all active queues
 */
export function getAllQueues() {
    return queues;
}

export default {
    getQueue,
    createQueue,
    deleteQueue,
    joinChannel,
    searchSong,
    getAllQueues,
};
