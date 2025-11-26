import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages to clear (1-100)').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  adminOnly: true,
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ Please provide a number between 1 and 100.',
        flags: 64,
      });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('✓ Messages Cleared')
        .setDescription(`Successfully deleted ${deleted.size} messages.`)
        .setFooter({ text: `By ${interaction.user.username}` });

      const msg = await interaction.reply({ embeds: [embed] });
      setTimeout(() => msg.delete(), 5000);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to clear messages.',
        flags: 64,
      });
    }
  },
};

