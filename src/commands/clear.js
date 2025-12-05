import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { addLog } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-1000, or 0 for all)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(1000)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('confirm')
        .setDescription('Skip confirmation for large deletions')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  moderatorOnly: true,

  async execute(interaction) {
    let amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');
    const skipConfirm = interaction.options.getBoolean('confirm') || false;

    // 0 means all messages
    const deleteAll = amount === 0;
    if (deleteAll) amount = 1000; // Max practical limit

    // Warn for large deletions without confirm
    if (amount > 100 && !skipConfirm && !deleteAll) {
      return interaction.reply({
        content: `⚠️ Anda akan menghapus **${amount}** pesan. Tambahkan \`confirm: True\` untuk melanjutkan.\n\`/clear amount:${amount} confirm:True\``,
        flags: 64,
      });
    }

    if (deleteAll && !skipConfirm) {
      return interaction.reply({
        content: `⚠️ Anda akan menghapus **SEMUA** pesan di channel ini. Tambahkan \`confirm: True\` untuk melanjutkan.\n\`/clear amount:0 confirm:True\``,
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    try {
      let totalDeleted = 0;
      let fetchedMessages;
      let iterations = 0;
      const maxIterations = Math.ceil(amount / 100);

      // Delete in batches of 100 (Discord API limit)
      while (totalDeleted < amount && iterations < maxIterations) {
        const toFetch = Math.min(100, amount - totalDeleted);

        fetchedMessages = await interaction.channel.messages.fetch({ limit: toFetch });

        // Filter by user if specified
        if (targetUser) {
          fetchedMessages = fetchedMessages.filter(msg => msg.author.id === targetUser.id);
        }

        // Filter out messages older than 14 days (Discord limitation)
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        fetchedMessages = fetchedMessages.filter(msg => msg.createdTimestamp > twoWeeksAgo);

        if (fetchedMessages.size === 0) break;

        // Bulk delete (max 100 messages at a time)
        const deleted = await interaction.channel.bulkDelete(fetchedMessages, true);
        totalDeleted += deleted.size;

        // If we got less than expected, we've reached the end
        if (deleted.size < toFetch) break;

        iterations++;

        // Small delay to avoid rate limits
        if (iterations < maxIterations) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      await addLog(
        interaction.guildId,
        interaction.user.id,
        'messages_cleared',
        `Cleared ${totalDeleted} messages${targetUser ? ` from ${targetUser.tag}` : ''}`,
        interaction.user.id
      );

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✓ Messages Cleared')
        .setDescription(`Successfully deleted **${totalDeleted}** messages.${targetUser ? `\nFiltered by: ${targetUser}` : ''}`)
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });
      setTimeout(() => interaction.deleteReply().catch(() => { }), 5000);
    } catch (error) {
      console.error('Clear command error:', error);
      await interaction.editReply({
        content: '❌ Failed to clear messages. Make sure the messages are not older than 14 days.',
      });
    }
  },
};
