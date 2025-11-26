import { REST, Routes, ActivityType, PresenceUpdateStatus } from 'discord.js';

export default {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`✓ Logged in as ${client.user.tag}`);
    
    const commands = [];
    client.slashCommands.forEach(cmd => {
      commands.push(cmd.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log('Registering slash commands...');
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('✓ Slash commands registered');
    } catch (error) {
      console.error('Failed to register slash commands:', error);
    }

    // Set bot status to Online with activity
    client.user.setPresence({
      activities: [{ name: '/help untuk bantuan', type: ActivityType.Listening }],
      status: PresenceUpdateStatus.Online,
    });
    console.log(`✓ Status set to: Online - Listening to /help untuk bantuan\n✓ Bot is fully ready!`);
  },
};

