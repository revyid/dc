import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { createGiveaway } from '../utils/database.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Create a giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Giveaway prize')
        .setRequired(true)
        .setMaxLength(200)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners (default: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Giveaway description')
        .setRequired(false)
        .setMaxLength(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
  moderatorOnly: true,
  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration');
    const winners = interaction.options.getInteger('winners') || 1;
    const description = interaction.options.getString('description') || 'React with 🎉 to enter!';
    const settings = getGuildSettings(interaction.guildId) || {};
    const giveawayChannel = settings.giveaway_channel || interaction.channelId;

    try {
      const channel = await interaction.guild.channels.fetch(giveawayChannel);
      const endsAt = new Date(Date.now() + duration * 60 * 1000);

      const embed = new EmbedBuilder()
        .setColor(0xe91e63)
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(description)
        .addFields(
          { name: '🎁 Prize', value: prize, inline: true },
          { name: '👥 Winners', value: winners.toString(), inline: true },
          { name: '⏰ Ends', value: `\u003ct:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true },
          { name: 'How to Enter', value: 'React with 🎉 to participate!', inline: false }
        )
        .setFooter({ text: `Hosted by ${interaction.user.username}` })
        .setTimestamp(endsAt);

      const message = await channel.send({ embeds: [embed] });
      await message.react('🎉');

      await createGiveaway(
        interaction.guildId,
        interaction.user.id,
        prize,
        description,
        endsAt.toISOString(),
        winners,
        channel.id
      );

      await interaction.reply({
        content: `✓ Giveaway created in ${channel}!`,
        flags: 64,
      });
    } catch (error) {
      console.error('Giveaway command error:', error);
      await interaction.reply({ content: '❌ Failed to create giveaway.', flags: 64 });
    }
  },
};
