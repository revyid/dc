# Discord Bot - Usage Guide

## Quick Start

### 1. Bot Setup
```bash
pnpm install
pnpm dev
```

### 2. Create Roles in Server
- `admin` - Full access to all commands
- `moderator` - Moderation commands
- `owner` - Limited access

### 3. Assign Roles to Members
- Right-click user → Edit → Add role

### 4. Use Commands
- Type `/` to see all commands
- All commands are slash commands (not prefix)

## Command Categories

### 🎮 Fun Commands (Everyone)
- `/dice` - Roll a dice (1-6) with reroll button
- `/coinflip` - Flip a coin with reroll button
- `/rps` - Play Rock Paper Scissors vs bot
- `/quiz` - Multiple choice quiz
- `/joke` - Get a random joke

### 📋 Info Commands (Everyone)
- `/help` - Show all available commands
- `/ping` - Check bot latency
- `/userinfo [@user]` - Get user information
- `/avatar [@user]` - Get user avatar
- `/profile [@user]` - Show user profile card
- `/serverinfo` - Get server information
- `/roleinfo <role>` - Get role information
- `/test` - Check bot status and stats

### 🛡️ Moderation Commands (Admin Role Required)
- `/kick <user> [reason]` - Kick member from server
- `/ban <user> [reason]` - Ban member from server
- `/warn <user> [reason]` - Warn a member
- `/mute <user> [duration] [reason]` - Mute member (default: 10m)
  - Duration formats: `10s`, `10m`, `1h`, `1d`
  - Max duration: 28 days
- `/unmute <user>` - Unmute a member
- `/clear <amount>` - Delete messages (1-100)
- `/addrole <user> <role>` - Add role to member
- `/removerole <user> <role>` - Remove role from member
- `/stafflist` - Show all staff members by role

## Command Details

### Kick
Removes a member from the server. Member receives a DM notification.

```
/kick @user reason:Being disruptive
```

**Validations:**
- Can't kick yourself
- Can't kick bot
- Bot must have higher role than target

### Ban
Permanently bans a member from the server. Member receives a DM notification.

```
/ban @user reason:Breaking rules
```

**Validations:**
- Can't ban yourself
- Can't ban bot
- Bot must have higher role than target

### Mute (Timeout)
Prevents member from talking for specified duration.

```
/mute @user duration:1h reason:Spam
/mute @user duration:30m
/mute @user  (defaults to 10 minutes)
```

**Duration Formats:**
- `10s` - 10 seconds
- `10m` - 10 minutes (default if no duration)
- `1h` - 1 hour
- `1d` - 1 day
- Max: 28 days

**Validations:**
- Can't mute yourself
- Can't mute bot
- Duration must be under 28 days

### Warn
Sends warning to member via DM and announces in channel.

```
/warn @user reason:First warning
```

### Clear
Deletes messages from current channel.

```
/clear 10  (delete last 10 messages)
/clear 50  (delete last 50 messages)
```

**Limits:**
- Minimum: 1 message
- Maximum: 100 messages

### Role Management

#### Add Role
```
/addrole @user @admin
```

#### Remove Role
```
/removerole @user @moderator
```

#### Staff List
```
/stafflist
```
Shows all members with admin, moderator, or owner roles.

## Interactive Features

### Dice Roller
- Rolls 1-6
- Click "Roll Again" to reroll
- Shows emoji dice representation

### Coin Flip
- Flip heads or tails
- Click "Flip Again" for another flip
- Coin emoji display

### Rock Paper Scissors
- Play against bot
- Choose: Rock, Paper, or Scissors
- Bot randomly picks
- Shows result and can play again

### Quiz
- Random multiple choice question
- 4 answer options
- Instant feedback
- Shows correct answer

## Permission System

### Role-Based Access
Commands check for roles defined in `.env`:
```env
ADMIN_ROLE=admin
MODERATOR_ROLE=moderator
OPERATOR_ROLE=owner
```

### Admin Commands Require Admin Role
User must have the `admin` role to use moderation commands.

## Troubleshooting

### Commands Not Appearing
- Bot offline? Check terminal
- Role names wrong? Check `.env`
- Wait 5-30 seconds for Discord to sync
- Restart Discord client

### Can't Use Admin Commands
- Missing `admin` role
- Check server roles
- Ask server owner to assign role

### Mute Doesn't Work
- Bot role must be ABOVE member's highest role
- Check bot permissions in server
- Duration might be invalid format

### Bot Can't Send DMs
- Member has DMs disabled
- That's okay - bot still completes action

## Tips & Tricks

1. **Moderation**: Always provide reason for kicks/bans for logs
2. **Muting**: Use `/mute @user duration:1h` for temporary timeouts
3. **Staff List**: Run `/stafflist` regularly to check current staff
4. **Role Hierarchy**: Admin role should be below bot's role in settings
5. **Interactive Games**: Use `/quiz` for fun engagement

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "You need the admin role" | Assign `admin` role to yourself |
| "I cannot kick/ban this member" | Bot role is too low in hierarchy |
| "Member not found" | Make sure member is still in server |
| "Already muted" | Use `/unmute` first |
| Commands show error | Check bot permissions in channel |

## Need Help?

- Check bot status: `/test`
- Get help: `/help`
- Check member info: `/userinfo @user`
- Check server info: `/serverinfo`
