import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  async execute(interaction, client) {
    const latency = client.ws.ping;
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🏓 Pong!')
      .setDescription(`Bot latency: **${latency}ms**`);

    await interaction.reply({ embeds: [embed] });
  },
};
