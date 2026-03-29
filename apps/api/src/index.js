const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('ioredis');
require('dotenv').config();

const { authenticate } = require('./middleware/rbac');
const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ─── HTTP + Socket.IO Server ──────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  transports: ['websocket', 'polling'],
});

// ─── Redis Pub/Sub Adapter ────────────────────────────────────────────────────
// Two separate clients: one publishes, one subscribes (Redis constraint)
const pubClient = createClient(REDIS_URL);
const subClient = pubClient.duplicate();

async function connectRedis() {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Redis adapter connected — Socket.IO is pub/sub ready');
  } catch (err) {
    console.warn('⚠️  Redis unavailable, falling back to in-memory adapter:', err.message);
    // App still works — just single-instance only without Redis
  }
}

// ─── Redis Direct Pub/Sub for cross-service events ────────────────────────────
// pub/sub channel: "task_events" — any service can publish, Socket.IO fans out
async function setupRedisPubSub() {
  try {
    const subscriber = createClient(REDIS_URL);
    await subscriber.connect();

    await subscriber.subscribe('task_events', (message) => {
      try {
        const event = JSON.parse(message);
        // Fan out to the right Socket.IO room
        const { type, projectId, payload } = event;
        if (projectId && type) {
          io.to(`project:${projectId}`).emit(type, payload);
          console.log(`[Redis→Socket.IO] ${type} → project:${projectId}`);
        }
      } catch (e) {
        console.error('[Redis] Failed to parse task_events message:', e.message);
      }
    });

    console.log('✅ Redis pub/sub subscribed to channel: task_events');

    // Expose publisher to routes via app so any route can publish events
    app.set('redisPub', pubClient);
  } catch (err) {
    console.warn('⚠️  Redis pub/sub not available:', err.message);
  }
}

// ─── Socket.IO Connection Handler ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`[Socket.IO] ${socket.id} joined room: project:${projectId}`);
    // Acknowledge join
    socket.emit('joined', { projectId, socketId: socket.id });
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`[Socket.IO] ${socket.id} left room: project:${projectId}`);
  });

  // Presence: broadcast to room that a user is viewing
  socket.on('user_presence', ({ projectId, userId }) => {
    socket.to(`project:${projectId}`).emit('user_presence', { userId, socketId: socket.id });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── Express Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Health check — public, before auth middleware
app.get('/health', async (_req, res) => {
  let redisStatus = 'disconnected';
  try {
    const pong = await pubClient.ping();
    redisStatus = pong === 'PONG' ? 'connected' : 'error';
  } catch (_) { }
  res.json({
    status: 'ok',
    redis: redisStatus,
    socketio: { adapter: redisStatus === 'connected' ? 'redis' : 'in-memory' },
    connectedClients: io.engine.clientsCount,
    uptime: Math.floor(process.uptime()) + 's',
  });
});

app.use(authenticate);

// Attach io to every request so routes can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/workspaces', workspaceRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);



// ─── Boot ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectRedis();
  await setupRedisPubSub();
  app.set('io', io);

  server.listen(port, () => {
    console.log(`\n🚀 API server running at http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/health\n`);
  });
}

start();
