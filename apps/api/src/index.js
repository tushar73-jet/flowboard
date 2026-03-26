const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { authenticate } = require('./middleware/rbac');

const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project room: project:${projectId}`);
  });
  
  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });
});

app.use(cors());
app.use(express.json());
app.use(authenticate); // Mock Authentication

// Register Routes
app.use('/workspaces', workspaceRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
