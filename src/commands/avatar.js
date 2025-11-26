import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user avatar')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get avatar from').setRequired(false)
    ),
  async execute(interaction, client) {
    const member = interaction.options.getMember('user') || interaction.member;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`${member.user.username}'s Avatar`)
      .setImage(member.user.displayAvatarURL({ size: 512 }));

    await interaction.reply({ embeds: [embed] });
  },
};

