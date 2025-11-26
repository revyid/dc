# Deployment Guide

## Vercel Deployment (Web Dashboard)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- PostgreSQL Neon database (already setup with `DATABASE_URL`)

### Step-by-step Deployment

#### 1. Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Copy from your `.env` file |
| `JWT_SECRET` | Any secure random string | Example: `your-secret-key-123456` |
| `NODE_ENV` | `production` | Already set in vercel.json |

#### 2. Deploy

```bash
# Option 1: Push to GitHub (auto-deploys)
git push origin main

# Option 2: Deploy directly from CLI
vercel --prod
```

#### 3. Verify Deployment

After deployment, visit: `https://your-project.vercel.app`

You should see the login page.

---

## Local Development

### Start Everything (Bot + Dashboard)
```bash
npm start
# or
pnpm start
```

### Start Only Web Dashboard
```bash
npm run web
```

### Start Only Discord Bot
```bash
npm run bot
```

---

## Discord Bot Deployment (VPS/Server)

### Option 1: Railway.app (Recommended for beginners)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add Environment Variables**
   - In Railway dashboard → Variables
   - Add: `DISCORD_TOKEN`, `DATABASE_URL`, `CLIENT_ID`

4. **Deploy**
   - Click "Deploy"
   - Set start command: `npm start`

### Option 2: DigitalOcean/Linode/AWS

1. Create a droplet/instance with Node.js
2. Clone repository: `git clone https://github.com/yourusername/dc.git`
3. Install dependencies: `npm install` or `pnpm install`
4. Create `.env` file with environment variables
5. Start bot: `npm start`
6. (Optional) Use PM2 to keep bot running:
   ```bash
   npm install -g pm2
   pm2 start npm --name "discord-bot" -- start
   pm2 save
   ```

### Option 3: Heroku (Legacy)

Note: Heroku free tier is no longer available. Use Railway or DigitalOcean instead.

---

## Environment Variables Reference

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=1442215372357894258

# Database (PostgreSQL Neon)
DATABASE_URL=postgresql://user:password@host/database

# Web Dashboard
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production

# Optional Features
ENABLE_DEVELOPER_BADGE=true
ENABLE_STATISTICS=true
ENABLE_AUTO_MODERATION=true
```

---

## Troubleshooting

### "DATABASE_URL not found" Error
- Check Vercel Environment Variables are set
- Verify `DATABASE_URL` is copied correctly from `.env`

### Bot not responding on Vercel
- Remember: Only the **web dashboard** runs on Vercel
- The **Discord bot** must run on a separate server (VPS/Railway/Heroku)
- They share the same PostgreSQL database

### Dashboard shows 0 stats
- Bot needs to be running and in a Discord server
- Invite bot to your test server
- Send messages to generate activity
- Stats update automatically

---

## Architecture

```
┌─────────────────────┐
│   Vercel (Free)     │
│  Web Dashboard      │
│ (src/web/server.js) │
└──────────┬──────────┘
           │
           │ Shared Database
           │
           ▼
┌─────────────────────┐
│ PostgreSQL Neon     │
│   (Shared)          │
└─────────────────────┘
           ▲
           │ Shared Database
           │
┌──────────┴──────────┐
│ VPS/Railway         │
│  Discord Bot        │
│ (src/index.js)      │
└─────────────────────┘
```

---

## Quick Start Checklist

- [ ] PostgreSQL Neon database created
- [ ] `DATABASE_URL` added to `.env`
- [ ] Discord bot token added to `.env`
- [ ] Bot runs locally: `npm start`
- [ ] Dashboard accessible at `http://localhost:3000`
- [ ] Admin account created: `npm run setup`
- [ ] Repository pushed to GitHub
- [ ] Vercel environment variables configured
- [ ] Web dashboard deployed to Vercel
- [ ] Bot deployed to VPS/Railway
- [ ] Both connected to same PostgreSQL database

---

For more help, check the README.md or DASHBOARD_README.md files.
