import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Make a suggestion for the server')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Your suggestion')
        .setRequired(true)
        .setMaxLength(1000)
    ),
  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    const settings = getGuildSettings(interaction.guildId) || {};
    const suggestionsChannel = settings.suggestions_channel;

    if (!suggestionsChannel) {
      return interaction.reply({
        content: '❌ Suggestions channel is not configured. Ask an admin to set it up.',
        flags: 64,
      });
    }

    try {
      const channel = await interaction.guild.channels.fetch(suggestionsChannel);

      if (!channel) {
        return interaction.reply({
          content: '❌ Suggestions channel not found.',
          flags: 64,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle('💡 New Suggestion')
        .setDescription(suggestion)
        .setTimestamp()
        .setFooter({ text: `Suggestion by ${interaction.user.tag}` });

      const message = await channel.send({ embeds: [embed] });
      await message.react('👍');
      await message.react('👎');

      await interaction.reply({
        content: '✓ Your suggestion has been submitted!',
        flags: 64,
      });
    } catch (error) {
      console.error('Suggest command error:', error);
      await interaction.reply({
        content: '❌ Failed to submit suggestion.',
        flags: 64,
      });
    }
  },
};
