import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Serve static assets from public folder (manifest, icons, favicon)
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

// Ensure data directory exists for encrypted cloud storage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const SYNC_FILE = path.join(DATA_DIR, 'encrypted_sync_store.json');
const USERS_FILE = path.join(DATA_DIR, 'users_store.json');

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

// Helper for user accounts
function readUsersStore(): Record<string, { email: string; passwordHash: string; syncId: string; createdAt: string }> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading users store:', err);
  }
  return {};
}

function writeUsersStore(data: Record<string, any>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing users store:', err);
  }
}

// REST Sync API routes
// 1. Health check
app.get('/api/sync/ping', (_req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. User Account Auth routes (Email & Password linking to Sync ID)
app.post('/api/auth/register', (req, res) => {
  const { email, passwordHash, syncId } = req.body;
  if (!email || !passwordHash || !syncId) {
    return res.status(400).json({ error: 'Email, password, dan Sync ID diperlukan.' });
  }

  const users = readUsersStore();
  const normalizedEmail = email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    return res.status(409).json({ error: 'Akun dengan email ini sudah terdaftar. Silakan login.' });
  }

  users[normalizedEmail] = {
    email: normalizedEmail,
    passwordHash,
    syncId,
    createdAt: new Date().toISOString(),
  };

  writeUsersStore(users);
  return res.json({ success: true, email: normalizedEmail, syncId });
});

app.post('/api/auth/login', (req, res) => {
  const { email, passwordHash } = req.body;
  if (!email || !passwordHash) {
    return res.status(400).json({ error: 'Email dan password diperlukan.' });
  }

  const users = readUsersStore();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users[normalizedEmail];

  if (!user || user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
  }

  // Also fetch the current encrypted cloud vault for this syncId
  const store = readSyncStore();
  const vault = store[user.syncId] || null;

  return res.json({
    success: true,
    email: user.email,
    syncId: user.syncId,
    vault,
  });
});

// 3. Push encrypted journals to cloud
app.post('/api/sync/push', (req, res) => {
  const { syncId, ciphertext, iv, salt, version, updatedAt, clientDeviceId } = req.body;
  if (!syncId || !ciphertext) {
    return res.status(400).json({ error: 'syncId and ciphertext are required' });
  }

  const store = readSyncStore();
  const existing = store[syncId];

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

  // Broadcast to all WebSocket clients listening to this room
  broadcastToRoom(syncId, {
    type: 'REMOTE_SYNC_MUTATION',
    syncId,
    ciphertext,
    iv,
    salt,
    version: store[syncId].version,
    updatedAt: store[syncId].updatedAt,
    clientDeviceId,
  }, clientDeviceId);

  return res.json({
    success: true,
    syncId,
    updatedAt: store[syncId].updatedAt,
    version: store[syncId].version,
  });
});

// 4. Pull encrypted journals from cloud
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

// 5. Check sync status
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

// -------------------------------------------------------------
// WebSocket Real-Time Infrastructure
// -------------------------------------------------------------
interface ClientInfo {
  ws: WebSocket;
  syncId?: string;
  deviceId?: string;
}

// Map of syncId -> Set of WebSockets
const syncRooms = new Map<string, Set<WebSocket>>();
const clientMetadata = new Map<WebSocket, ClientInfo>();

function broadcastToRoom(syncId: string, message: any, excludeDeviceId?: string) {
  const room = syncRooms.get(syncId);
  if (!room) return;

  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      const meta = clientMetadata.get(client);
      if (excludeDeviceId && meta && meta.deviceId === excludeDeviceId) {
        continue; // don't echo back to sender
      }
      try {
        client.send(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

function getConnectedDeviceCount(syncId: string): number {
  const room = syncRooms.get(syncId);
  if (!room) return 0;
  let count = 0;
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) count++;
  }
  return count;
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clientMetadata.set(ws, { ws });

    ws.on('message', (rawMessage: string) => {
      try {
        const msg = JSON.parse(rawMessage.toString());

        switch (msg.type) {
          case 'JOIN_ROOM': {
            const { syncId, deviceId } = msg;
            if (!syncId) return;

            // Remove from existing room if any
            const existingMeta = clientMetadata.get(ws);
            if (existingMeta && existingMeta.syncId && existingMeta.syncId !== syncId) {
              const oldRoom = syncRooms.get(existingMeta.syncId);
              if (oldRoom) {
                oldRoom.delete(ws);
                broadcastToRoom(existingMeta.syncId, {
                  type: 'PRESENCE_UPDATE',
                  syncId: existingMeta.syncId,
                  deviceCount: getConnectedDeviceCount(existingMeta.syncId),
                });
              }
            }

            // Register in new room
            if (!syncRooms.has(syncId)) {
              syncRooms.set(syncId, new Set());
            }
            syncRooms.get(syncId)!.add(ws);
            clientMetadata.set(ws, { ws, syncId, deviceId });

            const deviceCount = getConnectedDeviceCount(syncId);

            // Send confirmation to this client
            const store = readSyncStore();
            const latestRecord = store[syncId] || null;

            ws.send(
              JSON.stringify({
                type: 'ROOM_JOINED',
                syncId,
                deviceCount,
                latestRecord,
              })
            );

            // Broadcast presence to all other peers in the room
            broadcastToRoom(syncId, {
              type: 'PRESENCE_UPDATE',
              syncId,
              deviceCount,
              joinedDeviceId: deviceId,
            });
            break;
          }

          case 'PUSH_MUTATION': {
            const { syncId, ciphertext, iv, salt, version, updatedAt, clientDeviceId } = msg;
            if (!syncId || !ciphertext) return;

            // Save to persistent file
            const store = readSyncStore();
            const incomingUpdated = updatedAt ? new Date(updatedAt).getTime() : Date.now();

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

            // Confirm to sender
            ws.send(
              JSON.stringify({
                type: 'PUSH_ACK',
                syncId,
                updatedAt: store[syncId].updatedAt,
                version: store[syncId].version,
              })
            );

            // Broadcast real-time update to all other connected devices (HP, tablet, laptop)
            broadcastToRoom(
              syncId,
              {
                type: 'REMOTE_SYNC_MUTATION',
                syncId,
                ciphertext,
                iv,
                salt,
                version: store[syncId].version,
                updatedAt: store[syncId].updatedAt,
                clientDeviceId,
              },
              clientDeviceId
            );
            break;
          }

          case 'PING': {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      const meta = clientMetadata.get(ws);
      if (meta && meta.syncId) {
        const room = syncRooms.get(meta.syncId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            syncRooms.delete(meta.syncId);
          } else {
            broadcastToRoom(meta.syncId, {
              type: 'PRESENCE_UPDATE',
              syncId: meta.syncId,
              deviceCount: getConnectedDeviceCount(meta.syncId),
            });
          }
        }
      }
      clientMetadata.delete(ws);
    });
  });

  if (!isProduction) {
    // Dynamic import vite in dev mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: false,
        watch: null,
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

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TargetFlow server running on http://0.0.0.0:${PORT} with WebSocket on /ws (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
