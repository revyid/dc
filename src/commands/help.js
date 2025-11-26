import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  async execute(interaction, client) {
    const commands = client.slashCommands.map(cmd => ({
      name: cmd.data.name,
      description: cmd.data.description || 'No description',
      adminOnly: cmd.adminOnly ? ' (Admin only)' : '',
    }));

    const commandList = commands.map(cmd => `\`/${cmd.name}\` - ${cmd.description}${cmd.adminOnly}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📚 Available Commands')
      .setDescription(commandList || 'No commands available')
      .setFooter({ text: 'Use / to see all commands' });

    await interaction.reply({ embeds: [embed] });
  },
};

