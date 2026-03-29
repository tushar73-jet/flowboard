const express = require('express');
const prisma = require('../lib/prisma');
const { checkWorkspaceRole } = require('../middleware/rbac');

const router = express.Router();

// In-memory mock tasks for demo
let mockTasks = [
  { id: "1", title: "Setup Database", description: "Spin up Postgres with Docker.", status: "DONE", priority: "HIGH", projectId: "demo-project", updatedAt: new Date() },
  { id: "2", title: "Build Canvas", description: "Create React board view.", status: "IN_PROGRESS", priority: "MEDIUM", projectId: "demo-project", updatedAt: new Date() },
  { id: "3", title: "Auth flow", description: "Implement Clerk.", status: "TODO", priority: "HIGH", projectId: "demo-project", updatedAt: new Date() }
];

// Helper: resolve workspaceId from a projectId
async function resolveWorkspace(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  return project.workspaceId;
}

// GET /tasks?projectId=xxx  — any workspace member
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  // Demo bypass
  if (projectId === 'demo-project') return res.json(mockTasks);

  try {
    const workspaceId = await resolveWorkspace(projectId);
    if (!workspaceId) return res.status(404).json({ error: 'Project not found' });

    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const tasks = await prisma.task.findMany({ where: { projectId } });
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

// POST /tasks  — Owner or Admin only
router.post('/', async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  try {
    const workspaceId = await resolveWorkspace(projectId);
    if (!workspaceId) return res.status(404).json({ error: 'Project not found' });

    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.create({
      data: { title, description, status, priority, projectId, assigneeId }
    });
    const io = req.app.get('io');
    if (io) io.to(`project:${projectId}`).emit('task_created', task);
    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

// PUT /tasks/:id  — any workspace member can update status (drag-and-drop)
router.put('/:id', async (req, res) => {
  const { title, description, status, priority, assigneeId } = req.body;

  // Mock tasks
  if (['1', '2', '3'].includes(req.params.id)) {
    const idx = mockTasks.findIndex(t => t.id === req.params.id);
    if (idx !== -1) {
      mockTasks[idx] = { ...mockTasks[idx], title, description, status, priority, updatedAt: new Date() };
      const io = req.app.get('io');
      if (io) io.to('project:demo-project').emit('task_updated', mockTasks[idx]);
      return res.json(mockTasks[idx]);
    }
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    const access = await checkWorkspaceRole(req.user.id, existingTask.project.workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { title, description, status, priority, assigneeId }
    });
    const io = req.app.get('io');
    if (io) io.to(`project:${task.projectId}`).emit('task_updated', task);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// DELETE /tasks/:id  — Owner or Admin only
router.delete('/:id', async (req, res) => {
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    const access = await checkWorkspaceRole(req.user.id, existingTask.project.workspaceId, ['OWNER', 'ADMIN']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.delete({ where: { id: req.params.id } });
    const io = req.app.get('io');
    if (io) io.to(`project:${task.projectId}`).emit('task_deleted', task.id);
    res.status(204).send();
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

module.exports = router;
