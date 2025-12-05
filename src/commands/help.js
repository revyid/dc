import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  async execute(interaction, client) {
    const commands = client.slashCommands.map(cmd => ({
      name: cmd.data.name,
      description: cmd.data.description || 'No description',
      adminOnly: cmd.adminOnly || false,
      moderatorOnly: cmd.moderatorOnly || false,
    }));

    const publicCommands = commands.filter(cmd => !cmd.adminOnly && !cmd.moderatorOnly);
    const adminCommands = commands.filter(cmd => cmd.adminOnly);
    const modCommands = commands.filter(cmd => cmd.moderatorOnly);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📚 Available Commands')
      .setDescription('Here are all the available commands:')
      .setFooter({ text: 'Use / to see all commands' });

    if (publicCommands.length > 0) {
      embed.addFields({
        name: '👥 Public Commands',
        value: publicCommands.map(cmd => `\`/${cmd.name}\` - ${cmd.description}`).join('\n'),
        inline: false,
      });
    }

    if (modCommands.length > 0) {
      embed.addFields({
        name: '🛡️ Moderator Commands',
        value: modCommands.map(cmd => `\`/${cmd.name}\` - ${cmd.description}`).join('\n'),
        inline: false,
      });
    }

    if (adminCommands.length > 0) {
      embed.addFields({
        name: '👑 Admin Commands',
        value: adminCommands.map(cmd => `\`/${cmd.name}\` - ${cmd.description}`).join('\n'),
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
