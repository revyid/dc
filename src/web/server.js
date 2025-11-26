import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authMiddleware, loginAdmin } from './auth.js';
import { initializeDatabase, getBotStats, getActivityLogs, getLogs } from '../utils/db-postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(join(__dirname, 'public')));

// Initialize database on startup
await initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await loginAdmin(username, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await getBotStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Activity logs endpoint
app.get('/api/dashboard/logs', authMiddleware, async (req, res) => {
  try {
    const guildId = req.query.guildId;
    const limit = parseInt(req.query.limit) || 50;

    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID required' });
    }

    const logs = await getActivityLogs(guildId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Moderation logs endpoint
app.get('/api/dashboard/mod-logs', authMiddleware, async (req, res) => {
  try {
    const guildId = req.query.guildId;
    const limit = parseInt(req.query.limit) || 20;

    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID required' });
    }

    const logs = await getLogs(guildId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error getting mod logs:', error);
    res.status(500).json({ error: 'Failed to get mod logs' });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Web dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔐 Login at: http://localhost:${PORT}/login`);
});

export default app;
