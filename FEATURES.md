# 📚 Features & Commands Guide

## Core Features

### ⚙️ Settings Management (`/settings`)
Kelola pengaturan server dengan interface interaktif.

**Fitur:**
- 👋 **Welcome Channel**: Set channel untuk welcome messages
- 👋 **Goodbye Channel**: Set channel untuk goodbye messages
- 📋 **Logs Channel**: Set channel untuk moderation logs
- 🎯 **Custom Prefix**: Ubah prefix commands (opsional)
- ⚠️ **Max Warnings**: Atur jumlah maksimal warning sebelum aksi otomatis

**Akses:** Admin only

---

## Moderation & Logging

### 📋 Moderation Logs (`/logs`)
Lihat history moderation actions di server.

**Options:**
- `user` (optional): Filter logs untuk specific user
- `limit` (1-20): Berapa banyak logs ditampilkan

**Example:**
```
/logs user:@user limit:15
```

**Akses:** Moderator+

---

## Business Features

### 🎫 Support Tickets (`/ticket`)

#### Create Ticket
Buat support ticket untuk issues, requests, dll.

```
/ticket create topic:bug_report
```

**Available Topics:**
- 🐛 Bug Report
- 💡 Feature Request
- ❓ Question
- ⚠️ Report User
- 💰 Billing

**Fitur:**
- Auto-create private channel
- Ticket ID tracking
- One-click close button
- Automatic channel deletion setelah ditutup

#### List Tickets
```
/ticket list
```
Lihat semua open tickets di server.

**Akses:** Siapa saja bisa buat, moderator+ bisa manage

---

### 📊 Server Statistics (`/statistics`)

#### Guild Statistics
```
/statistics
```
Lihat overview statistik server:
- Total members
- Active users
- Messages sent
- Commands used
- Total warnings
- Moderation logs

#### User Statistics
```
/statistics user:@user
```
Lihat statistik individual user:
- Messages sent
- Commands used
- Join date
- Last message timestamp

**Akses:** Siapa saja

---

## All Commands Reference

| Command | Description | Akses |
|---------|-------------|-------|
| `/help` | Lihat semua commands | Public |
| `/ping` | Ping bot | Public |
| `/test` | Test bot stats | Public |
| `/joke` | Get random joke | Public |
| `/dice` | Roll dice game | Public |
| `/coinflip` | Flip coin game | Public |
| `/rps` | Rock-Paper-Scissors game | Public |
| `/quiz` | Quiz game | Public |
| `/avatar` | Get user avatar | Public |
| `/userinfo` | User information | Public |
| `/profile` | User profile | Public |
| `/serverinfo` | Server information | Public |
| `/roleinfo` | Role information | Public |
| `/remind` | Set personal reminder | Public |
| `/report` | Report user misconduct | Public |
| `/settings` | Server settings panel | Admin |
| `/statistics` | View statistics | Public |
| `/analytics` | Advanced analytics | Public |
| `/logs` | View moderation logs | Moderator |
| `/ticket` | Create/list support tickets | Public |
| `/kick` | Kick member | Moderator |
| `/ban` | Ban member | Admin |
| `/warn` | Warn member (with auto-ban) | Moderator |
| `/mute` | Mute member | Moderator |
| `/unmute` | Unmute member | Moderator |
| `/clear` | Clear messages | Moderator |
| `/addrole` | Add role to member | Admin |
| `/removerole` | Remove role from member | Admin |
| `/stafflist` | List staff members | Public |

---

## Database Structure

Bot menggunakan SQLite database (`data/bot.db`) dengan tables berikut:

### `guild_settings`
Guild-specific configuration
- welcome_channel, goodbye_channel, logs_channel
- custom prefix, auto role, ticket category
- max_warnings setting

### `member_warnings`
Warning history per member

### `member_logs`
Moderation action logs (kick, ban, mute, warn)

### `user_statistics`
User activity tracking
- messages sent, commands used
- join date, last message

### `tickets`
Support ticket tracking
- ticket_id, channel_id, status
- creator_id, timestamps

### `reminders`
User reminders (future feature)

---

## Setup Checklist

- [ ] Set welcome channel dengan `/settings`
- [ ] Set goodbye channel dengan `/settings`
- [ ] Set logs channel untuk moderation dengan `/settings`
- [ ] Assign admin/moderator roles di `.env`
- [ ] Test `/ticket create` untuk membuat test ticket
- [ ] View logs dengan `/logs`
- [ ] Check statistics dengan `/statistics`

---

## Best Practices

✅ **DO:**
- Gunakan logs channel untuk audit trail
- Setup welcome/goodbye channels untuk member experience
- Regularly check statistics untuk server health
- Use tickets untuk organized support

❌ **DON'T:**
- Ignore logs channel - gunakan untuk accountability
- Set invalid channels untuk settings
- Overuse mute - gunakan warnings dulu

---

## Support

Jika ada issues atau pertanyaan, gunakan `/ticket create topic:question`
