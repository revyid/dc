# Discord Bot + Admin Dashboard

A full-featured Discord bot with a web-based admin dashboard, now running on PostgreSQL with support for Vercel deployment.

## 🚀 Features

### Discord Bot
- 35+ slash commands
- Advanced moderation tools (warnings, kicks, timeouts)
- Reputation and leveling system
- Giveaway management
- Suggestion queue
- Anti-spam & auto-moderation
- Ticket system
- Developer badge tracking

### Admin Dashboard
- 🔐 Secure login with JWT authentication
- 📊 Real-time statistics and activity logs
- 🎛️ Server configuration management
- 📋 Moderation logs viewer
- 👥 User reputation tracking
- 🎁 Giveaway management

### Database
- PostgreSQL (Neon) support
- Automatic migrations
- 12+ data tables with proper relationships

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm or pnpm
- PostgreSQL Neon account
- Discord Bot application

### 1. Clone & Install

```bash
git clone <repo-url>
cd dc
pnpm install
# or npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required values:**
```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
DATABASE_URL=postgresql://...your-neon-connection-string...
ADMIN_ROLE=role_id
MODERATOR_ROLE=role_id
OPERATOR_ROLE=role_id
```

### 3. Setup Admin User

```bash
npm run setup
```

Follow the prompts to create your admin account credentials.

### 4. Start the Application

```bash
npm start
```

This starts both:
- 🤖 Discord Bot (gateway & slash commands)
- 🌐 Web Dashboard (http://localhost:3000)

## 📊 Web Dashboard

### Access
- URL: `http://localhost:3000`
- Login with credentials created in setup

### Features
- **Dashboard**: View bot statistics, recent activity
- **Logs**: Real-time moderation and activity logs
- **Settings**: Configure bot behavior per server
- **Analytics**: User engagement and command usage

## 🌍 Deployment to Vercel

### 1. Prepare for Deployment

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/web/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/web/server.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "DISCORD_TOKEN": "@discord_token"
  }
}
```

### 2. Set Environment Variables in Vercel

In Vercel dashboard, set:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `DISCORD_TOKEN`: Your Discord bot token

### 3. Deploy

```bash
vercel
```

The dashboard will be available at your Vercel URL.

**Note**: The Discord bot runs locally. To run the bot on a VPS/server, deploy `src/index-combined.js` separately.

## 📁 Project Structure

```
dc/
├── src/
│   ├── commands/          # 35+ slash commands
│   ├── interactions/      # Button, menu, modal handlers
│   ├── events/            # Discord event handlers
│   ├── utils/
│   │   ├── db-postgres.js # PostgreSQL queries
│   │   ├── database.js    # Legacy SQLite (deprecated)
│   │   ├── permissions.js # Role-based access
│   │   └── ...
│   ├── web/
│   │   ├── server.js      # Express server
│   │   ├── auth.js        # JWT authentication
│   │   └── public/
│   │       └── index.html # Dashboard UI
│   ├── index.js           # Bot only
│   └── index-combined.js  # Bot + Web server
├── .env                   # Configuration
├── .env.example          # Example config
├── package.json
└── README.md
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Bot token | `MTA4...` |
| `CLIENT_ID` | Application ID | `12345...` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `PORT` | Web server port | `3000` |
| `JWT_SECRET` | Session encryption key | `random-string` |
| `ADMIN_ROLE` | Admin role snowflake | `12345...` |
| `MODERATOR_ROLE` | Mod role snowflake | `12345...` |
| `OPERATOR_ROLE` | Operator role snowflake | `12345...` |

## 📚 API Reference

### Authentication
- `POST /api/login` - Login with username/password

### Dashboard
- `GET /api/dashboard/stats` - Bot statistics
- `GET /api/dashboard/logs` - Activity logs
- `GET /api/dashboard/mod-logs` - Moderation logs

All endpoints require JWT token in `Authorization` header.

## 🤖 Bot Commands

### Admin Commands
- `/settings` - Configure bot per server
- `/warn` - Warn a member
- `/kick` - Kick a member
- `/timeout` - Timeout a member
- `/clear` - Clear messages

### Utility Commands
- `/reputation` - Vote on members
- `/leaderboard` - View rankings
- `/level` - Check user level
- `/suggest` - Submit suggestions
- `/giveaway` - Create giveaways

See `/commands` directory for full list.

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens with 24h expiration
- Role-based access control
- CORS enabled for trusted origins
- Database queries parameterized to prevent injection

## 📝 Development

Run in development mode:
```bash
npm run dev
```

Just the web server:
```bash
npm run web
```

Just the bot:
```bash
npm run bot
```

## 🐛 Troubleshooting

### Database connection failed
- Check `DATABASE_URL` in `.env`
- Verify Neon database is accessible
- Test connection: `psql $DATABASE_URL`

### Admin login not working
- Run `npm run setup` again
- Check admin user exists in database
- Verify `JWT_SECRET` is set

### Dashboard not loading
- Check port 3000 is available
- Verify `CORS` is properly configured
- Check browser console for errors

## 📄 License

MIT

## 🤝 Support

For issues and feature requests, open a GitHub issue.
