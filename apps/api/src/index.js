const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { authenticate } = require('./middleware/rbac');
const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const subtaskRoutes = require('./routes/subtasks');
const commentRoutes = require('./routes/comments');
const labelRoutes = require('./routes/labels');

const app = express();
const port = process.env.PORT || 4000;

// ─── HTTP + Socket.IO Server ──────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  transports: ['websocket', 'polling'],
});

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
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
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
app.use('/subtasks', subtaskRoutes);
app.use('/comments', commentRoutes);
app.use('/labels', labelRoutes);



// ─── Boot ─────────────────────────────────────────────────────────────────────
function start() {
  app.set('io', io);

  server.listen(port, () => {
    console.log(`\n🚀 API server running at http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/health\n`);
  });
}

start();
