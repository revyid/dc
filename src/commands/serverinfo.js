import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),
  async execute(interaction, client) {
    const guild = interaction.guild;

    try {
      const owner = guild.ownerId ? `<@${guild.ownerId}>` : 'Unknown';

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🏢 Server Information')
        .setThumbnail(guild.iconURL({ size: 512 }))
        .addFields(
          { name: 'Server Name', value: guild.name, inline: true },
          { name: 'Owner', value: owner, inline: true },
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Members', value: guild.memberCount.toString(), inline: true },
          { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
          { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
          {
            name: 'Created',
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
            inline: false,
          },
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('ServerInfo command error:', error);
      await interaction.reply({
        content: '❌ Failed to get server information. Please try again.',
        flags: 64,
      });
    }
  },
};

