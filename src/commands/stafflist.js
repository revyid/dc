import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stafflist')
    .setDescription('Show all staff members'),
  async execute(interaction, client) {
    const adminRole = process.env.ADMIN_ROLE;
    const moderatorRole = process.env.MODERATOR_ROLE;
    const operatorRole = process.env.OPERATOR_ROLE;

    await interaction.deferReply();

    const members = await interaction.guild.members.fetch();

    const admins = members.filter(m =>
      m.roles.cache.some(r => r.name.toLowerCase() === adminRole?.toLowerCase())
    );

    const moderators = members.filter(m =>
      m.roles.cache.some(r => r.name.toLowerCase() === moderatorRole?.toLowerCase())
    );

    const operators = members.filter(m =>
      m.roles.cache.some(r => r.name.toLowerCase() === operatorRole?.toLowerCase())
    );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('👥 Staff List')
      .addFields(
        {
          name: `🔴 Admin (${admins.size})`,
          value: admins.size > 0 ? admins.map(m => m.user.tag).join('\n') : 'None',
          inline: false,
        },
        {
          name: `🟡 Moderator (${moderators.size})`,
          value: moderators.size > 0 ? moderators.map(m => m.user.tag).join('\n') : 'None',
          inline: false,
        },
        {
          name: `🟢 Operator (${operators.size})`,
          value: operators.size > 0 ? operators.map(m => m.user.tag).join('\n') : 'None',
          inline: false,
        },
      )
      .setFooter({ text: `Total Staff: ${admins.size + moderators.size + operators.size}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
