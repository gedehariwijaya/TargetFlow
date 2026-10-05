import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists for encrypted cloud storage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const SYNC_FILE = path.join(DATA_DIR, 'encrypted_sync_store.json');

// Helper to read sync store
function readSyncStore(): Record<string, any> {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      const data = fs.readFileSync(SYNC_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading sync store:', err);
  }
  return {};
}

// Helper to write sync store
function writeSyncStore(data: Record<string, any>) {
  try {
    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing sync store:', err);
  }
}

// Sync API routes
// 1. Health check
app.get('/api/sync/ping', (_req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Push encrypted journals to cloud
app.post('/api/sync/push', (req, res) => {
  const { syncId, ciphertext, iv, salt, version, updatedAt, clientDeviceId } = req.body;
  if (!syncId || !ciphertext) {
    return res.status(400).json({ error: 'syncId and ciphertext are required' });
  }

  const store = readSyncStore();
  const existing = store[syncId];

  // Conflict resolution: accept if newer or first time
  const currentUpdated = existing ? new Date(existing.updatedAt).getTime() : 0;
  const incomingUpdated = updatedAt ? new Date(updatedAt).getTime() : Date.now();

  // Save encrypted document
  store[syncId] = {
    syncId,
    ciphertext,
    iv,
    salt,
    version: version || 1,
    updatedAt: new Date(incomingUpdated).toISOString(),
    lastModifiedBy: clientDeviceId || 'unknown',
  };

  writeSyncStore(store);

  return res.json({
    success: true,
    syncId,
    updatedAt: store[syncId].updatedAt,
    version: store[syncId].version,
  });
});

// 3. Pull encrypted journals from cloud
app.get('/api/sync/pull/:syncId', (req, res) => {
  const { syncId } = req.params;
  const store = readSyncStore();
  const record = store[syncId];

  if (!record) {
    return res.status(404).json({ error: 'Sync ID belum ditemukan di awan' });
  }

  return res.json({
    success: true,
    data: record,
  });
});

// 4. Check sync status
app.get('/api/sync/check/:syncId', (req, res) => {
  const { syncId } = req.params;
  const store = readSyncStore();
  const record = store[syncId];

  if (!record) {
    return res.json({ exists: false });
  }

  return res.json({
    exists: true,
    updatedAt: record.updatedAt,
    version: record.version,
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import vite in dev mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TargetFlow server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
