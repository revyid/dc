import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get user avatar')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get avatar from').setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(`[Download](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`);

    await interaction.reply({ embeds: [embed] });
  },
};
