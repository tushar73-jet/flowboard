const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL, 'https://flowboard-web-r1fi.vercel.app'] 
  : ['http://localhost:3000', 'https://flowboard-web-r1fi.vercel.app'];

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`[Socket.IO] ${socket.id} joined room: project:${projectId}`);
    socket.emit('joined', { projectId, socketId: socket.id });
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`[Socket.IO] ${socket.id} left room: project:${projectId}`);
  });

  socket.on('join_workspace', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    console.log(`[Socket.IO] ${socket.id} joined room: workspace:${workspaceId}`);
  });

  socket.on('leave_workspace', (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
    console.log(`[Socket.IO] ${socket.id} left room: workspace:${workspaceId}`);
  });

  socket.on('user_presence', ({ projectId, userId }) => {
    socket.to(`project:${projectId}`).emit('user_presence', { userId, socketId: socket.id });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
  });
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '10kb' })); 

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.use(apiLimiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connectedClients: io.engine.clientsCount,
    uptime: Math.floor(process.uptime()) + 's',
  });
});

app.use(authenticate);

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/workspaces', workspaceRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/subtasks', subtaskRoutes);
app.use('/comments', commentRoutes);
app.use('/labels', labelRoutes);



function start() {
  app.set('io', io);

  server.listen(port, () => {
    console.log(`\n🚀 API server running at http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/health\n`);
  });
}

start();
