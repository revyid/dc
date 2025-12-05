# 🎯 Advanced Features Guide

## Extended Commands (NEW!)

### 🔔 Reminders (`/remind`)

Set personal reminders untuk nanti.

**Usage:**
```
/remind time:5m message:Take a break
/remind time:1h message:Check server status
/remind time:2d message:Weekly meeting
```

**Time Formats:**
- `s` - Seconds (5s)
- `m` - Minutes (30m)
- `h` - Hours (2h)
- `d` - Days (1d)

**Features:**
- Personal reminders (private)
- Database persistence
- Human-readable timestamps
- Reminder duration display

---

### 📋 Report System (`/report`)

Report user misconduct untuk staff review.

**Usage:**
```
/report user:@user reason:spam description:Sending spam messages
```

**Available Reasons:**
- 🔊 Spam
- 😠 Harassment
- 🔞 NSFW
- 🔗 Phishing
- 💬 Inappropriate Language
- 🎮 Cheating
- ℹ️ Other

**Features:**
- 7 predefined categories
- Optional detailed description
- Auto-logging to database
- Staff notifications
- Audit trail

**Workflow:**
1. User submits report via `/report`
2. Report saved to `member_logs` table
3. Staff get notified in logs channel
4. Staff can review reports via `/logs`

---

### ⚠️ Enhanced Warning System

Updated `/warn` command dengan auto-moderation.

**New Features:**
- Database tracking of all warnings
- Warning threshold calculation
- Auto-ban ketika mencapai max warnings
- User notification dengan warning count
- Warning percentage display

**Warning Flow:**
```
/warn @user reason:spam
↓
Add warning to database
↓
Check against max_warnings setting
↓
If warning_count >= max_warnings:
   → Auto-ban user
   → Send notification
   → Log action
   → Update database
```

**Example:**
```
/settings → Set max_warnings = 3
/warn @user1 reason:spam → Warning 1/3
/warn @user1 reason:spam → Warning 2/3
/warn @user1 reason:spam → Warning 3/3 → AUTO-BAN TRIGGERED
```

---

### 📊 Advanced Analytics (`/analytics`)

Comprehensive server analytics dengan 4 sub-commands.

#### 1. Overview (`/analytics overview`)

Server-wide statistics overview.

**Shows:**
- Active users count
- Total messages sent
- Total commands used
- Average messages per user
- Average commands per user
- Total moderation actions
- Warnings, kicks, bans, mutes count
- Total warned users

#### 2. Growth (`/analytics growth`)

Member growth trends & analytics.

**Shows:**
- New members this week
- New members this month
- Total members
- Growth rate percentage
- Member acquisition trends

**Use Case:** Track server growth over time

#### 3. Moderation (`/analytics moderation`)

Moderation activity trends & top moderators.

**Shows:**
- Actions this week
- Actions this month
- Top 5 moderators by action count
- Moderation activity breakdown

**Use Case:** Identify most active moderators, track enforcement trends

#### 4. Activity (`/analytics activity`)

Top active users breakdown.

**Shows:**
- Top 10 most active users
- Message count per user
- Command usage per user 
- User ranking by activity

**Use Case:** Identify engaged community members

---

## Auto-Moderation System

### How It Works

1. **Configurable Threshold** via `/settings warnings`
2. **Automatic Tracking** when using `/warn`
3. **Automatic Enforcement** at threshold
4. **User Notification** before ban
5. **Audit Logging** of all actions

### Example Scenario

**Setup:**
```
/settings → Set max_warnings = 3
```

**Action Sequence:**
1. User breaks rules → `/warn @user1 reason:spam`
   - Warning 1/3 added to database
   - User DM: You have 2 more warnings
   
2. User breaks rules again → `/warn @user1 reason:spam`
   - Warning 2/3 added to database
   - User DM: You have 1 more warning
   
3. User breaks rules again → `/warn @user1 reason:spam`
   - Warning 3/3 added to database
   - ⚙️ AUTO-BAN TRIGGERED
   - User auto-banned
   - Staff notification in logs
   - Audit log entry

---

## Database Enhancements

### member_warnings Table
Tracks all warnings with:
- Guild ID
- User ID (warned)
- Moderator ID (who warned)
- Reason
- Timestamp

**Query Example:**
```sql
SELECT * FROM member_warnings 
WHERE guild_id = 'YOUR_GUILD_ID' 
AND user_id = 'USER_ID'
ORDER BY created_at DESC;
```

### member_logs Table
Enhanced to include 'report' action type.

**Actions Tracked:**
- kick
- ban
- warn
- mute
- report (**NEW**)
- (extensible for future actions)

---

## New Utilities

### automod.js

Provides auto-moderation functionality:

**Functions:**
- `autoModerate()` - Main function untuk auto-ban
- `checkWarningThreshold()` - Check warning status

**Usage in Code:**
```javascript
import { autoModerate } from '../utils/automod.js';

await autoModerate(guildId, userId, moderatorId, reason, client);
```

---

## Feature Combinations

### Scenario 1: Report → Warn → Ban Flow

```
User A reports User B for harassment
↓
/report user:@B reason:harassment
↓
Staff reviews report via /logs
↓
Staff warns user: /warn @B reason:harassment
↓
Repeat warnings until max_warnings threshold
↓
Auto-ban triggered → User B banned
```

### Scenario 2: Analytics-Driven Moderation

```
/analytics moderation → Review trends
↓
Identify problematic users from logs
↓
Use /logs user:@user to see details
↓
Apply targeted warnings/bans
↓
Track impact with /analytics overview
```

### Scenario 3: Community Insights

```
/analytics overview → Server stats
↓
/analytics growth → Member trends
↓
/analytics activity → User engagement
↓
Use insights for community decisions
↓
/settings → Adjust moderation policies
```

---

## Command Reference - Advanced Features

| Command | Feature | Subcommands/Options |
|---------|---------|-------------------|
| `/remind` | Personal reminders | time, message |
| `/report` | User misconduct reports | user, reason, description |
| `/warn` | Enhanced warnings | user, reason |
| `/analytics` | Advanced analytics | overview, growth, moderation, activity |
| `/settings` | Server config | (panels for channels/prefix/warnings) |
| `/ticket` | Support tickets | create, list |
| `/logs` | Moderation logs | user, limit |

---

## Configuration for Advanced Features

### Setting Up Auto-Moderation

1. Configure max warnings:
   ```
   /settings → Max Warnings → Set to 3 (or desired number)
   ```

2. Create logs channel:
   ```
   Create #logs or #mod-logs channel
   /settings → Logs Channel → Select #logs
   ```

3. Test with warnings:
   ```
   /warn @testuser reason:test
   (repeat until max_warnings reached)
   → User auto-banned
   ```

### Setting Up Report System

1. Ensure logs channel configured:
   ```
   /settings → Logs Channel → Select channel
   ```

2. Users can now report:
   ```
   /report user:@user reason:spam description:details
   → Report logged
   → Staff notified
   ```

3. Staff review reports:
   ```
   /logs → See all reports
   /logs user:@user → See user-specific
   ```

### Using Analytics

1. View overview:
   ```
   /analytics overview
   → Guild-wide statistics
   ```

2. Monitor growth:
   ```
   /analytics growth
   → Weekly/monthly trends
   ```

3. Check moderation:
   ```
   /analytics moderation
   → Top moderators & trends
   ```

4. Identify active users:
   ```
   /analytics activity
   → Top 10 users
   ```

---

## Best Practices

✅ **DO:**
- Set max_warnings policy in settings
- Use reports for community feedback
- Review analytics regularly
- Configure logs channel for audit trail
- Use reminders for personal tasks
- Monitor top users and moderators

❌ **DON'T:**
- Set max_warnings too high (reduces effectiveness)
- Ignore moderation logs
- Use auto-ban without clear policy
- Report for minor issues (escalates)
- Forget to configure settings first

---

## Advanced Usage Patterns

### Pattern 1: Progressive Discipline

```
1st warn → User aware of rules
2nd warn → Escalation signal
3rd warn → Final warning
Auto-ban → Enforcement
```

### Pattern 2: Report → Evidence → Action

```
Report submitted
↓
Evidence in logs
↓
Decision made
↓
Action taken (warn/mute/kick/ban)
↓
User notified
```

### Pattern 3: Data-Driven Policies

```
Collect analytics
↓
Identify trends (most warned users, etc)
↓
Adjust policies
↓
Monitor impact
↓
Iterate
```

---

## Troubleshooting Advanced Features

### Auto-ban Not Triggering
- Check max_warnings setting: `/settings`
- Verify bot has ban permission
- Check warning count: `/logs user:@user`

### Reports Not Showing
- Verify logs channel: `/settings → Logs Channel`
- Check bot can send messages to logs channel
- Confirm report was submitted: `/logs`

### Analytics Showing Zero
- Wait for some activity (messages, commands)
- Check database isn't empty: `/statistics`
- Ensure guild_id matches current server

### Reminders Not Working
- Check reminder time format: Use 5m, 1h, 2d
- Ensure time is in future (not past)
- Discord DM permissions enabled

---

## Performance Considerations

**Database:**
- Warnings indexed by user_id for fast lookup
- Reports stored in member_logs with index
- Analytics queries optimized with COUNT/SUM
- WAL mode enabled for concurrent access

**Recommendations:**
- Review and archive old logs monthly
- Check bot memory usage monthly
- Monitor database file size
- Clean up resolved tickets

---

## Future Enhancement Ideas

1. **Scheduled Announcements**
   - `/announce schedule time message`

2. **Custom Roles**
   - Auto-role assignment on join

3. **Word Filters**
   - Auto-action on filtered words

4. **Member Verification**
   - Email/phone verification gates

5. **Leaderboards**
   - Gamification features

6. **Automated Reports**
   - Spam detection
   - Raid detection
   - Bot account detection

---

This guide covers all advanced features added! 🚀
