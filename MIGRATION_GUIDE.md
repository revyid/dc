# Migration Guide: SQLite → PostgreSQL

This guide helps you migrate your existing Discord bot from SQLite (better-sqlite3) to PostgreSQL (Neon).

## ⚠️ Important

This migration will:
- ✅ Create new PostgreSQL tables
- ✅ Preserve all data structure
- ⚠️ Not automatically transfer existing SQLite data (manual export/import if needed)

## 🔄 Step-by-Step Migration

### 1. Backup Existing Database (Optional)

If you have existing data in SQLite, backup first:

```bash
cp data/bot.db data/bot.db.backup
```

### 2. Update Environment Variables

Edit `.env`:

```env
# Add these new variables
DATABASE_URL=postgresql://neondb_owner:npg_R92zpKrqTHiS@ep-winter-firefly-a1aot6x0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secret-key
PORT=3000

# Keep existing bot variables
DISCORD_TOKEN=...
CLIENT_ID=...
```

### 3. Install New Dependencies

```bash
pnpm install
# or npm install
```

This will install:
- `pg` - PostgreSQL client
- `express` - Web server
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens

### 4. Setup Admin User

```bash
npm run setup
```

Follow the prompts to create your admin account.

### 5. Start the Application

```bash
npm start
```

This now runs:
- 🤖 Discord Bot (localhost)
- 🌐 Web Dashboard (localhost:3000)

## 📊 Data Migration (If You Have Existing Data)

### Export from SQLite

Create `migrate-data.js`:

```javascript
import Database from 'better-sqlite3';
import { pool } from './src/utils/db-postgres.js';

const sqliteDb = new Database('./data/bot.db');

async function migrateData() {
  try {
    // Get all guild settings from SQLite
    const guildSettings = sqliteDb.prepare('SELECT * FROM guild_settings').all();
    
    for (const setting of guildSettings) {
      // Insert into PostgreSQL
      await pool.query(
        `INSERT INTO guild_settings (guild_id, welcome_channel, goodbye_channel, ...)
         VALUES ($1, $2, $3, ...)
         ON CONFLICT (guild_id) DO UPDATE SET ...`,
        [setting.guild_id, setting.welcome_channel, ...]
      );
    }
    
    console.log('✓ Data migration complete');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateData();
```

Run: `node migrate-data.js`

### Or Use Manual SQL Export

```bash
# Export SQLite to SQL
sqlite3 data/bot.db .dump > backup.sql

# Review and adapt SQL syntax for PostgreSQL
# Then import
psql $DATABASE_URL < backup.sql
```

## 🔌 Code Changes Required

### Old (SQLite)
```javascript
import { db } from '../utils/database.js';

const result = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

### New (PostgreSQL)
```javascript
import { pool } from '../utils/db-postgres.js';

const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Key differences:**
- `db.prepare()` → `pool.query()` 
- `.get()` / `.all()` → `await` with `.rows`
- `?` placeholders → `$1, $2, ...` positional parameters
- All queries are now **async**

## ✅ Verification Checklist

- [ ] PostgreSQL database connection works
- [ ] Admin user created
- [ ] Bot starts without errors
- [ ] Dashboard accessible at localhost:3000
- [ ] Login works with admin credentials
- [ ] Stats page loads
- [ ] Activity logs display
- [ ] Discord commands still work

## 🚀 Deployment to Vercel

### Environment Variables

Set in Vercel dashboard:

```
DATABASE_URL = postgresql://...
JWT_SECRET = (generate a secure random string)
NODE_ENV = production
```

### Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL + Web Dashboard"
git push
vercel
```

### Bot Running

**Note:** The Discord bot needs to run continuously. Options:

1. **Local Machine** - Run `npm start` on your computer
2. **VPS/Server** - Deploy bot to Heroku, Railway, or similar
3. **Docker** - Containerize and deploy anywhere

## 🆘 Troubleshooting

### Connection refused

```bash
# Test connection
psql $DATABASE_URL
```

If fails:
- Verify connection string is correct
- Check Neon dashboard for active database
- Confirm IP whitelist settings (if applicable)

### Migrations failed

Delete the database and restart:
1. Delete all tables in Neon database
2. Restart application - tables will be recreated
3. Re-run `npm run setup`

### Old code still using SQLite

The old `database.js` is still present but should not be imported:

```javascript
// ❌ Don't use
import { db } from '../utils/database.js';

// ✅ Use instead
import { pool } from '../utils/db-postgres.js';
```

## 📝 Rollback Plan

If you need to go back to SQLite:

```bash
# Restore backup
cp data/bot.db.backup data/bot.db

# Revert dependencies
git checkout package.json
pnpm install

# Start with old code
git checkout src/utils/database.js
npm run bot
```

## 📚 Additional Resources

- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [pg NPM Package](https://node-postgres.com/)
- [PostgreSQL Syntax](https://www.postgresql.org/docs/current/)

## ✨ Next Steps

After migration:

1. **Set up Discord.js commands** to log activity to database
2. **Configure dashboard** to show your server-specific data
3. **Deploy web dashboard** to Vercel
4. **Deploy bot** to continuous hosting

For questions or issues, refer to `DASHBOARD_README.md`
