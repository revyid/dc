# Statistics Tracking System

## Overview
The statistics tracking system automatically collects user activity data (messages and commands) and makes it available through analytics commands.

## How It Works

### 1. Message Tracking
**File**: `src/events/messageCreate.js`

Every message sent by a user triggers:
```javascript
trackMessage(guildId, userId)
```

This increments the `messages_sent` counter in the `user_statistics` table.

**Conditions**:
- Message must NOT be from a bot
- Message must be in a guild (not DM)
- Automatically updates `last_message` timestamp

### 2. Command Tracking
**File**: `src/events/interactionCreate.js`

Every slash command executed triggers:
```javascript
trackCommand(guildId, userId)
```

This increments the `commands_used` counter in the `user_statistics` table.

**Conditions**:
- Must be a chat input command (slash command)
- Must be in a guild (not DM)
- Runs AFTER command execution
- Automatically updates `last_message` timestamp

### 3. Database Schema
**File**: `src/utils/database.js`

```sql
CREATE TABLE user_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  commands_used INTEGER DEFAULT 0,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message DATETIME,
  UNIQUE(guild_id, user_id)
);
```

### 4. Utility Functions
**File**: `src/utils/statistics.js`

#### updateUserStatistics(guildId, userId, data)
- Creates new user record or updates existing
- Increments counters specified in `data` object
- Updates `last_message` timestamp

#### trackMessage(guildId, userId)
- Wrapper for `updateUserStatistics` with `{ messages_sent: 1 }`

#### trackCommand(guildId, userId)
- Wrapper for `updateUserStatistics` with `{ commands_used: 1 }`

#### getUserStatistics(guildId, userId)
- Returns statistics for specific user

#### getTopActiveUsers(guildId, limit=10)
- Returns top N users sorted by `messages_sent`
- Used by `/analytics activity` command

#### getGuildStatistics(guildId)
- Returns aggregate statistics:
  - `active_users`: Unique users with activity
  - `total_messages`: Sum of all messages
  - `total_commands`: Sum of all commands
  - `avg_messages`: Average messages per user
  - `avg_commands`: Average commands per user

## Available Commands

### /analytics activity
Shows top 10 active users ranked by message count.

**Output**:
- User mentions
- Message count
- Command count

### /statistics
General statistics about user activity.

### /teststats
Debug command to test tracking system - shows:
- Current guild statistics
- Top 10 users if data exists
- Useful for verifying tracking works

## Testing the System

### Step 1: Restart Bot
```powershell
# Stop bot, then start it
npm start
```

### Step 2: Generate Test Data
1. Send 5+ messages in the Discord server
2. Execute 3+ slash commands (e.g., `/help`, `/ping`, `/serverinfo`)

### Step 3: Check Stats
Run `/teststats` to see if data was collected.

Expected output:
```
Guild Statistics:
Active Users: 1
Total Messages: 5+
Total Commands: 3+

Top 10 Users:
1. @YourName - 5 messages, 3 commands
```

### Step 4: Verify Analytics
Run `/analytics activity` to see if the top users list appears.

## Troubleshooting

### Issue: "/analytics activity shows 'No data'"

**Check 1**: Run `/teststats` to see current data
- If `Active Users: 0`, no tracking is happening

**Check 2**: Send a message and check console
- Look for errors when tracking message
- Check if database file is writable

**Check 3**: Verify tracking is called
- In `messageCreate.js`, add: `console.log('Message tracked');`
- In `interactionCreate.js`, add: `console.log('Command tracked');`
- Send messages/commands and check console

**Check 4**: Database permissions
- Verify bot can write to `./bot.db` file
- Check file permissions (Windows: Properties > Security)

**Check 5**: Table migration
- Verify `user_statistics` table exists in database
- Run: `SELECT * FROM user_statistics;` (using SQLite tool)

### Issue: Console shows database errors

**Error**: "database is locked"
- Bot is running multiple instances
- Stop all instances, delete `.db-shm` and `.db-wal` files, restart

**Error**: "no such table"
- Database wasn't initialized properly
- Delete `bot.db` file and restart bot
- Bot will recreate all tables automatically

**Error**: "not an integer"
- Boolean being inserted as string
- Already fixed in code, verify statistics.js has proper type handling

## Data Persistence

- Data is stored in `bot.db` (SQLite database)
- Survives bot restarts
- Can be backed up by copying `bot.db` file
- WAL mode enabled for better performance

## Real-Time Updates

Statistics are updated in real-time:
1. User sends message → Immediately tracked
2. User runs command → Immediately tracked
3. Analytics command queries current data → Shows latest counts

No caching or delays.

## Privacy & Data

- All data is guild-specific (not shared between servers)
- Tracks user IDs (not usernames, which could change)
- `joined_at` shows when first activity was recorded
- `last_message` shows most recent activity timestamp

## Future Enhancements

Possible additions:
- Reaction tracking
- Thread creation tracking
- Voice channel time tracking
- Daily/weekly activity trends
- User-specific statistics command
- Leaderboard with badges for top contributors
- Export statistics to CSV/JSON
