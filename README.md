# Discord Bot - Production Ready

Full-featured modular Discord bot dengan Node.js, discord.js, slash commands, dan SQLite database.

## Fitur

- ✅ Slash Commands (Auto-registered)
- ✅ Interactive Buttons & UI
- ✅ Role-Based Permission System (Admin/Moderator/Operator)
- ✅ **SQLite Database untuk persistency**
- ✅ **Settings Management Panel**
- ✅ **Support Ticket System**
- ✅ **Moderation Logging & Auto-Ban**
- ✅ **Server Statistics & Advanced Analytics**
- ✅ **Reminder System**
- ✅ **Report System untuk User Misconduct**
- ✅ Welcome & Goodbye messages dengan database support
- ✅ Admin commands (kick, ban, warn, mute, clear)
- ✅ Role management commands
- ✅ User info commands
- ✅ Fun games (Dice, Coin Flip, Rock Paper Scissors, Quiz)
- ✅ Modular command system (dynamic loading)
- ✅ Event handling system
- ✅ Production-ready error handling

## Commands

### 📋 General Commands
- `/ping` - Check bot latency
- `/help` - Show all available commands
- `/joke` - Tell a random joke
- `/dice` - Roll a dice
- `/coinflip` - Flip a coin
- `/rps` - Play Rock Paper Scissors
- `/quiz` - Play a quick quiz!

### 👤 User Commands
- `/userinfo [@user]` - Get user information
- `/avatar [@user]` - Get user avatar
- `/profile [@user]` - Show user profile card
- `/serverinfo` - Get server information
- `/roleinfo <role>` - Get role information

### 🛡️ Admin Commands (Requires Admin Role)
- `/kick <user> [reason]` - Kick a member
- `/ban <user> [reason]` - Ban a member
- `/warn <user> [reason]` - Warn a member
- `/mute <user> [duration] [reason]` - Mute a member (default 10m)
- `/unmute <user>` - Unmute a member
- `/clear <amount>` - Clear messages (1-100)
- `/addrole <user> <role>` - Add role to member
- `/removerole <user> <role>` - Remove role from member
- `/stafflist` - Show all staff members

### ⚙️ Server Management
- `/settings` - Server settings panel (welcome, goodbye, logs channels)
- `/statistics [user]` - View server or user statistics
- `/logs [user] [limit]` - View moderation logs

### 🎫 Business Features
- `/ticket create <topic>` - Create support ticket (bug, feature, question, report, billing)
- `/ticket list` - List all open tickets

### 🔔 User Features
- `/remind <time> <message>` - Set personal reminder
- `/report <user> <reason> [description]` - Report user misconduct

### 📊 Advanced Features
- `/analytics overview` - Server-wide statistics
- `/analytics growth` - Member growth trends
- `/analytics moderation` - Moderation activity
- `/analytics activity` - Top active users

## Setup

### Prerequisites
- Node.js 16+
- pnpm
- Discord Bot Token
- SQLite3 (included via better-sqlite3)

### Installation

```bash
pnpm install
```

### Configuration

Create a `.env` file in the root directory with:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
PREFIX=!
ADMIN_ROLE=admin
MODERATOR_ROLE=moderator
OPERATOR_ROLE=owner
```

### Database

Bot automatically creates SQLite database at `data/bot.db` dengan schema:
- `guild_settings` - Server configuration
- `member_warnings` - Warning logs
- `member_logs` - Moderation actions
- `user_statistics` - User activity tracking
- `tickets` - Support tickets
- `reminders` - User reminders (future)

### Running

**Development:**
```bash
pnpm dev
```

**Production:**
```bash
pnpm start
```

Bot akan:
1. Load semua commands dari `src/commands/`
2. Load semua interactions dari `src/interactions/`
3. Load semua events dari `src/events/`
4. Register slash commands
5. Connect ke Discord

---

## Project Structure

```
.
├── src/
│   ├── commands/          # Slash commands
│   ├── interactions/      # Button & modal handlers
│   ├── events/            # Discord events
│   ├── utils/
│   │   ├── database.js    # SQLite manager
│   │   └── permissions.js # Role-based access control
│   └── index.js           # Bot entry point
├── data/
│   └── bot.db             # SQLite database (auto-created)
├── .env                   # Configuration
└── package.json
```

---

## Database Schema

### guild_settings
```sql
guild_id (PK), welcome_channel, goodbye_channel, logs_channel,
prefix, auto_role, ticket_category, max_warnings
```

### member_warnings
```sql
id (PK), guild_id, user_id, warned_by, reason, created_at
```

### member_logs
```sql
id (PK), guild_id, user_id, action, reason, moderator_id, created_at
```

### user_statistics
```sql
id (PK), guild_id, user_id, messages_sent, commands_used,
last_message, joined_at
```

### tickets
```sql
id (PK), ticket_id (UNIQUE), guild_id, creator_id, channel_id,
status, created_at, closed_at
```

---

## Features Detail

For detailed feature documentation, see [FEATURES.md](./FEATURES.md)

---

## Permission Levels

- **Public**: Any user can use
- **Moderator**: Requires MODERATOR_ROLE
- **Admin**: Requires ADMIN_ROLE
- **Owner**: Requires OPERATOR_ROLE

---

## Configuration

1. **Buat Bot di Discord Developer Portal:**
   - Buka https://discord.com/developers/applications
   - Click "New Application"
   - Go to "Bot" → Click "Add Bot"
   - Copy Token

2. **Aktifkan Privileged Gateway Intents:**
   - Go to "Bot" → Scroll ke "Privileged Gateway Intents"
   - Aktifkan:
     - ✅ PRESENCE INTENT
     - ✅ SERVER MEMBERS INTENT
     - ✅ MESSAGE CONTENT INTENT

3. **Setup Permissions & Invite URL:**
   - Go to "OAuth2" → "URL Generator"
   - Pilih scopes: `bot`
   - Pilih permissions: `Administrator` (atau customize)
   - Copy URL dan invite bot ke server

4. **Edit `.env` file:**
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
PREFIX=!
OPERATOR_ROLE=operator
MODERATOR_ROLE=moderator
ADMIN_ROLE=admin
```

5. **Setup Role di Server:**
   - Buat 3 roles di server:
     - `admin` - Full access
     - `moderator` - Moderation access
     - `operator` - Limited access
   - Berikan roles ke members sesuai kebutuhan

6. **Buat Channels di Server:**
   - `#welcome` - untuk welcome messages
   - `#goodbye` - untuk goodbye messages

### Running

Development mode:
```bash
pnpm dev
```

Build & Run:
```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── index.js              # Bot entry point & command registration
├── utils/
│   └── permissions.js    # Permission checking utilities
├── commands/             # Slash command files (auto-load)
│   ├── help.js
│   ├── ping.js
│   ├── kick.js
│   ├── ban.js
│   ├── warn.js
│   ├── mute.js
│   ├── unmute.js
│   ├── clear.js
│   ├── addrole.js
│   ├── removerole.js
│   ├── stafflist.js
│   ├── userinfo.js
│   ├── serverinfo.js
│   ├── avatar.js
│   ├── profile.js
│   ├── roleinfo.js
│   ├── dice.js
│   ├── coinflip.js
│   ├── rps.js
│   ├── joke.js
│   └── quiz.js
├── interactions/        # Button/Modal handlers (auto-load)
│   ├── roll_again.js
│   ├── flip_again.js
│   ├── rps_rock.js
│   ├── rps_paper.js
│   ├── rps_scissors.js
│   ├── quiz_0.js
│   ├── quiz_1.js
│   ├── quiz_2.js
│   └── quiz_3.js
└── events/              # Event handlers (auto-load)
    ├── ready.js
    ├── interactionCreate.js
    ├── messageCreate.js
    ├── guildMemberAdd.js
    └── guildMemberRemove.js
```

## Adding Custom Commands

1. Create new file in `src/commands/`:

```javascript
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description'),
  
  adminOnly: true, // Require admin role
  // moderatorOnly: true, // Or moderator role
  // operatorOnly: true,  // Or operator role
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Command Title')
      .setDescription('Command response');
    
    await interaction.reply({ embeds: [embed] });
  },
};
```

2. Command akan otomatis dimuat dan registered sebagai slash command saat bot start.

## Adding Button Interactions

1. Create new file in `src/interactions/`:

```javascript
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'button_id', // Match the button customId
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Button Response');
    
    await interaction.update({ embeds: [embed] });
  },
};
```

2. Use button dalam command:

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('button_id')
      .setLabel('Click Me')
      .setStyle(ButtonStyle.Primary),
  );

await interaction.reply({ components: [row] });
```

## Features Details

### 🎮 Fun Games
- **Dice** - Roll a dice dengan tombol Roll Again
- **Coin Flip** - Flip a coin dengan tombol Flip Again
- **RPS** - Rock Paper Scissors game dengan 3 tombol
- **Quiz** - Multiple choice quiz dengan instant feedback

### 🛡️ Moderation
- Kick/Ban dengan reason logging
- Mute/Unmute dengan duration customizable
- Clear messages dengan bulk delete
- Warn member dengan DM notification
- Role management (add/remove roles)

### 👥 User Management
- User profile cards dengan embeds
- User info dengan role listing
- Server info dengan member count
- Role info dengan permission listing
- Staff list showing all admins/mods/operators

### 🔐 Permission System
- Role-based access control
- Customizable role names via `.env`
- Automatic permission checking
- Admin/Moderator/Operator tiers

## Role-Based Permission System

Bot menggunakan sistem role-based untuk admin commands:

| Role | Permissions |
|------|------------|
| `admin` | All commands (kick, ban, warn, mute, addrole, etc.) |
| `moderator` | Moderation commands (mute, warn, clear) |
| `operator` | Limited commands (warn only) |

Cek role di env:
```env
ADMIN_ROLE=admin
MODERATOR_ROLE=moderator
OPERATOR_ROLE=operator
```

### Custom Role Setup:
Ubah nama roles di `.env` sesuai roles di server Anda:
```env
ADMIN_ROLE=staff_admin
MODERATOR_ROLE=staff_mod
OPERATOR_ROLE=helper
```

### 👥 User Management
- User profile cards dengan embeds
- User info dengan role listing
- Server info dengan member count
- Role info dengan permission listing

## License

MIT
