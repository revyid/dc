# 🚀 Quick Start Guide

## 1️⃣ Initial Setup (5 minutes)

### Step 1: Configuration
Edit `.env` file dengan bot token dan settings:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_app_id
ADMIN_ROLE=admin
MODERATOR_ROLE=moderator
OPERATOR_ROLE=owner
```

### Step 2: Start Bot
```bash
pnpm start
```

Bot akan:
- Load 26 commands
- Load 16 interactions
- Create `data/bot.db` dengan tables
- Register slash commands
- Connect ke Discord

✅ Bot ready!

---

## 2️⃣ First Configuration (10 minutes)

### Step 1: Create Channels
Create di server Anda:
- `#welcome` (atau custom name)
- `#goodbye` (atau custom name)
- `#logs` (atau custom name)

### Step 2: Configure Settings
```
/settings
```

**Klik tombol untuk:**
1. 👋 Welcome Channel → Select #welcome
2. 👋 Goodbye Channel → Select #goodbye
3. 📋 Logs Channel → Select #logs
4. 🎯 Prefix → Set prefix (optional)
5. ⚠️ Max Warnings → Set limit (default 3)

✅ Settings done!

---

## 3️⃣ Test Features (5 minutes)

### Test Commands
```
/ping                          # Test bot response
/help                          # See all commands
/statistics                    # View stats
/logs                          # View moderation logs (empty first time)
/ticket create topic:question  # Create test ticket
/ticket list                   # List tickets
```

### Test Games
```
/dice                          # Roll dice
/coinflip                      # Flip coin
/rps                           # Rock paper scissors
/quiz                          # Trivia quiz
```

✅ All working!

---

## 4️⃣ Test Moderation (10 minutes)

### Create Test Member (or use yourself with role)

#### Add Role to Member
```
/addrole @member admin
```

#### Kick Test
```
/kick @member reason:testing
```

#### Ban Test
```
/ban @member reason:testing
```

#### Warn Test
```
/warn @member reason:testing
```

#### Check Logs
```
/logs user:@member
```

✅ Moderation working!

---

## 5️⃣ Use Tickets (5 minutes)

### Create Support Ticket
```
/ticket create topic:bug_report
```

Discord akan:
1. Create channel `ticket-TK-XXXXX`
2. Add you as member (private to others)
3. Show ticket panel with close button

### List Open Tickets
```
/ticket list
```

### Close Ticket
Click "Tutup Ticket" button → channel auto-deletes

✅ Tickets working!

---

## 📊 Database Files

Location: `data/bot.db`

**Auto-created tables:**
- ✅ guild_settings - Server config
- ✅ member_warnings - Warning history
- ✅ member_logs - All moderation actions
- ✅ user_statistics - Activity tracking
- ✅ tickets - Support tickets
- ✅ reminders - Future reminders

**To view DB:**
```bash
# Install sqlite3 CLI (optional)
sqlite3 data/bot.db

# Example queries
SELECT * FROM guild_settings;
SELECT * FROM member_logs WHERE guild_id = 'YOUR_GUILD_ID' LIMIT 10;
SELECT * FROM user_statistics WHERE guild_id = 'YOUR_GUILD_ID';
```

---

## 🎮 Command Examples

### User Info
```
/userinfo @user              # Get user details
/avatar @user                # Get user avatar
/profile @user               # Show profile card
/serverinfo                  # Server info
/roleinfo admin              # Role info
/stafflist                   # List all staff
```

### Moderation
```
/kick @user reason:spam
/ban @user reason:harassment
/warn @user reason:breaking-rules
/mute @user 1h reason:timeout
/unmute @user
/clear 50                    # Delete 50 messages
/addrole @user moderator
/removerole @user moderator
```

### Management
```
/settings              # Configure server
/statistics            # View stats
/statistics @user      # User stats
/logs                  # All moderation logs
/logs @user            # User moderation logs
/logs user:@user limit:20
```

### Tickets
```
/ticket create topic:bug_report
/ticket create topic:feature_request
/ticket create topic:question
/ticket create topic:report
/ticket create topic:billing
/ticket list
```

### Fun
```
/dice                  # Roll dice
/coinflip              # Flip coin
/rps                   # Rock-paper-scissors
/quiz                  # Trivia
/joke                  # Random joke
```

---

## ⚙️ Admin Settings Overview

### Settings Panel (`/settings`)

**What it does:**
- Visual panel dengan 5 categories
- Interactive buttons untuk setting
- Channel selection menus
- Text input modals
- Reset button

**Settings Available:**
- Welcome channel (for join messages)
- Goodbye channel (for leave messages)
- Logs channel (for moderation audit)
- Custom prefix (if using prefix commands)
- Max warnings (before auto-action)

### How to Use Settings Panel
1. Run `/settings` (Admin only)
2. Click button untuk setting yang ingin di-ubah
3. Select channel atau input value
4. Confirm
5. Settings saved to database!

---

## 🔑 Permission Levels

| Level | Role | Can Use |
|-------|------|---------|
| Public | Everyone | /help, /ping, /dice, /userinfo, /stats, /ticket |
| Moderator | moderator | /kick, /warn, /mute, /clear, /logs |
| Admin | admin | /ban, /addrole, /removerole, /settings |
| Owner | owner | All commands |

---

## 🆘 Troubleshooting

### Bot Won't Start
```
Error: Cannot find module
```
→ Run `pnpm install`

### Slash Commands Not Showing
```
Bot loaded but no commands appear
```
→ Wait 5-10 minutes for Discord to sync
→ Or restart bot with new CLIENT_ID

### Database Error
```
Error: Cannot open database
```
→ Check `data/` folder exists
→ Run `pnpm start` again (auto-creates)

### Settings Not Saving
```
Selected channel but no save
```
→ Check you have Admin role
→ Try again - database may be locked

### Ticket Channel Not Created
```
Error creating ticket channel
```
→ Check bot has permission to create channels
→ Check guild hasn't hit channel limit

---

## 📚 More Info

- [README.md](./README.md) - Full documentation
- [FEATURES.md](./FEATURES.md) - Detailed feature guide
- [CONFIG.md](./CONFIG.md) - Configuration guide
- [USAGE.md](./USAGE.md) - User guide

---

## 🎉 You're Ready!

Bot is fully set up dan functional. Silakan:
- ✅ Configure settings untuk server Anda
- ✅ Test semua features
- ✅ Integrate dengan workflow server
- ✅ Customize sesuai kebutuhan

**Happy moderation! 🚀**
