import { EmbedBuilder } from 'discord.js';
import { getWarnings, db, getGuildSettings } from '../utils/database.js';

export const autoModerate = async (guildId, userId, moderatorId, reason, client) => {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const settings = getGuildSettings(guildId);
    const maxWarnings = settings?.max_warnings || 3;

    const warnings = getWarnings(guildId, userId);
    const warningCount = warnings.length;

    if (warningCount >= maxWarnings) {
      try {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('🚫 Auto-Ban Triggered')
          .setDescription(`You have been automatically banned for reaching ${maxWarnings} warnings.`)
          .addFields(
            { name: 'Reason', value: reason || 'Multiple Warnings', inline: false },
            { name: 'Total Warnings', value: warningCount.toString(), inline: true }
          );

        try {
          await member.send({ embeds: [embed] }).catch(() => {});
        } catch (err) {
          console.log(`Could not DM user ${userId}`);
        }

        await member.ban({ reason: `Auto-ban: ${maxWarnings} warnings reached` });

        const logsChannel = guild.channels.cache.find(ch => ch.name === 'logs' || ch.name === 'mod-logs');
        if (logsChannel && logsChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('⚙️ Auto-Moderation: Ban')
            .setDescription(`User automatically banned for reaching warning limit`)
            .addFields(
              { name: 'User', value: `<@${userId}>`, inline: true },
              { name: 'Total Warnings', value: warningCount.toString(), inline: true },
              { name: 'Reason', value: reason || 'Multiple Warnings', inline: false }
            );

          await logsChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }

        return { action: 'banned', warningCount };
      } catch (banError) {
        console.error(`Failed to auto-ban user ${userId}:`, banError);
      }
    }
  } catch (error) {
    console.error('Auto-moderation error:', error);
  }
};

export const checkWarningThreshold = (guildId, userId) => {
  try {
    const settings = getGuildSettings(guildId);
    const maxWarnings = settings?.max_warnings || 3;
    const warnings = getWarnings(guildId, userId);
    const warningCount = warnings.length;

    return {
      current: warningCount,
      max: maxWarnings,
      percentage: Math.round((warningCount / maxWarnings) * 100),
      willBan: warningCount >= maxWarnings,
      nextCount: maxWarnings - warningCount,
    };
  } catch (error) {
    console.error('Check warning threshold error:', error);
    return null;
  }
};
