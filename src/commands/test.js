import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test command untuk memverifikasi bot working properly'),
  
  async execute(interaction, client) {
    const uptime = Math.floor(client.uptime / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Bot Status')
      .addFields(
        { name: '🤖 Bot Name', value: client.user.username, inline: true },
        { name: '🆔 Client ID', value: client.user.id, inline: true },
        { name: '⏱️ Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '📊 Servers', value: client.guilds.cache.size.toString(), inline: true },
        { name: '👥 Users', value: client.users.cache.size.toString(), inline: true },
        { name: '💾 Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
      )
      .setFooter({ text: 'Bot is working perfectly!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
