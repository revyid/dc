import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Discord Bot + Web Dashboard...\n');

// Start web server in background
console.log('🌐 Starting web server...');
const webProcess = spawn('node', [join(__dirname, 'web', 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env },
});

webProcess.on('error', (err) => {
  console.error('Web server error:', err);
});

// Initialize Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates, // Required for voice channel
  ],
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.interactions = new Collection();
client.events = new Collection();

const loadCommands = async () => {
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if (command.default.data && command.default.execute) {
      client.slashCommands.set(command.default.data.name, command.default);
      console.log(`✓ Command loaded: ${command.default.data.name}`);
    }
  }
};

const loadInteractions = async () => {
  const interactionsPath = join(__dirname, 'interactions');
  const files = readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = join(interactionsPath, file);
    const interaction = await import(`file://${filePath}`);

    if (interaction.default.customId && interaction.default.execute) {
      client.interactions.set(interaction.default.customId, interaction.default);
      console.log(`✓ Interaction loaded: ${interaction.default.customId instanceof RegExp ? interaction.default.customId.source : interaction.default.customId}`);
    }

    const namedExports = Object.entries(interaction).filter(([key, val]) => key !== 'default' && val.customId && val.execute);
    for (const [, handler] of namedExports) {
      client.interactions.set(handler.customId, handler);
      console.log(`✓ Interaction loaded: ${handler.customId instanceof RegExp ? handler.customId.source : handler.customId}`);
    }
  }
};

const loadEvents = async () => {
  const eventsPath = join(__dirname, 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(`file://${filePath}`);
    if (event.default.name && event.default.execute) {
      if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(client, ...args));
      } else {
        client.on(event.default.name, (...args) => event.default.execute(client, ...args));
      }
      console.log(`✓ Event loaded: ${event.default.name}`);
    }
  }
};

const registerSlashCommands = async () => {
  const commands = [];
  client.slashCommands.forEach(cmd => {
    commands.push(cmd.data.toJSON());
  });

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('\n📝 Registering slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✓ Slash commands registered\n');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
};

const init = async () => {
  try {
    console.log('📦 Loading commands...');
    await loadCommands();
    console.log('🎛️  Loading interactions...');
    await loadInteractions();
    console.log('📡 Loading events...');
    await loadEvents();
    console.log('\n🤖 Bot starting...\n');
    await registerSlashCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  client.destroy();
  webProcess.kill();
  process.exit(0);
});

init();
