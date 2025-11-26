import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get info for').setRequired(false)
    ),
  async execute(interaction, client) {
    const member = interaction.options.getMember('user') || interaction.member;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('👤 User Information')
      .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: 'Username', value: member.user.username, inline: true },
        { name: 'Tag', value: member.user.tag, inline: true },
        { name: 'ID', value: member.user.id, inline: true },
        {
          name: 'Account Created',
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
        {
          name: 'Joined Server',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false,
        },
        {
          name: 'Roles',
          value: member.roles.cache.map(r => r.toString()).join(', ') || 'No roles',
          inline: false,
        },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

