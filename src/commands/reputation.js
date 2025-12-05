import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getReputation, getLeaderboard } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reputation')
    .setDescription('Manage reputation system')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Check reputation of a user')
        .addUserOption(option =>
          option.setName('user').setDescription('User to check').setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leaderboard')
        .setDescription('View reputation leaderboard')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'check') {
      const user = interaction.options.getUser('user') || interaction.user;

      try {
        const rep = await getReputation(interaction.guildId, user.id);

        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`⭐ ${user.username}'s Reputation`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'Points', value: (rep?.reputation_points || 0).toString(), inline: true },
            { name: 'Upvotes', value: (rep?.total_upvotes || 0).toString(), inline: true },
            { name: 'Downvotes', value: (rep?.total_downvotes || 0).toString(), inline: true }
          );

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Reputation check error:', error);
        await interaction.reply({ content: '❌ Failed to fetch reputation.', flags: 64 });
      }
    } else if (subcommand === 'leaderboard') {
      try {
        const leaderboard = await getLeaderboard(interaction.guildId, 10);

        if (leaderboard.length === 0) {
          return interaction.reply({ content: '📊 No reputation data yet.', flags: 64 });
        }

        const description = await Promise.all(
          leaderboard.map(async(entry, i) => {
            const user = await interaction.client.users.fetch(entry.user_id).catch(() => null);
            const username = user ? user.tag : 'Unknown User';
            return `**${i + 1}.** ${username} - ${entry.reputation_points || 0} points`;
          })
        );

        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🏆 Reputation Leaderboard')
          .setDescription(description.join('\\n'))
          .setFooter({ text: 'Top 10 members by reputation' });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Reputation leaderboard error:', error);
        await interaction.reply({ content: '❌ Failed to fetch leaderboard.', flags: 64 });
      }
    }
  },
};
