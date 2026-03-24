const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticate } = require('./middleware/rbac');

const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(authenticate); // Mock Authentication

// Register Routes
app.use('/workspaces', workspaceRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
