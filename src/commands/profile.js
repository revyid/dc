import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show your profile card')
    .addUserOption(option =>
      option.setName('user').setDescription('User to show profile').setRequired(false)
    ),
  async execute(interaction, client) {
    const member = interaction.options.getMember('user') || interaction.member;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('profile_view')
          .setLabel('View Full Profile')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
      );

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: '👤 Username', value: member.user.username, inline: true },
        { name: '🏷️ Discriminator', value: member.user.discriminator, inline: true },
        { name: '🆔 ID', value: member.user.id, inline: true },
        {
          name: '📅 Account Created',
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: '🚪 Joined Server',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: true,
        },
        { name: '⭐ Status', value: member.presence?.status || 'offline', inline: true },
        {
          name: `👥 Roles (${member.roles.cache.size - 1})`,
          value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).slice(0, 10).join(', ') || 'No roles',
          inline: false,
        },
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
