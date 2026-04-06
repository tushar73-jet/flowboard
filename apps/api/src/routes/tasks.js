const express = require('express');
const prisma = require('../lib/prisma');
const { checkWorkspaceRole } = require('../middleware/rbac');
const { logActivity } = require('../lib/activity');

const router = express.Router();

async function resolveWorkspace(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return project?.workspaceId || null;
}

router.get('/', async (req, res) => {
  const { projectId, search, priority, status } = req.query;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  try {
    const workspaceId = await resolveWorkspace(projectId);
    if (!workspaceId) return res.status(404).json({ error: 'Project not found' });

    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const where = { projectId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (priority) where.priority = priority;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({ 
      where, 
      include: { subtasks: true, labels: true } 
    });
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  try {
    const workspaceId = await resolveWorkspace(projectId);
    if (!workspaceId) return res.status(404).json({ error: 'Project not found' });

    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        status, 
        priority, 
        projectId, 
        assigneeId, 
        dueDate: dueDate ? new Date(dueDate) : null 
      },
      include: { labels: true }
    });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task.id,
      entityName: task.title,
      io: req.io
    });
    if (req.io) req.io.to(`project:${projectId}`).emit('task_created', task);

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, assigneeId, dueDate } = req.body;

  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const workspaceId = existing.project.workspaceId;
    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { 
        title, 
        description, 
        status, 
        priority, 
        assigneeId,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined
      },
      include: { labels: true }
    });

    if (status !== existing.status) {
      await logActivity({
        workspaceId,
        userId: req.user.id,
        action: 'TASK_MOVED',
        entityType: 'TASK',
        entityId: task.id,
        entityName: task.title,
        metadata: { from: existing.status, to: status },
        io: req.io
      });
    }

    if (req.io) req.io.to(`project:${task.projectId}`).emit('task_updated', task);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const workspaceId = existing.project.workspaceId;
    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.delete({ where: { id: req.params.id } });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: task.id,
      entityName: task.title,
      io: req.io
    });

    if (req.io) req.io.to(`project:${task.projectId}`).emit('task_deleted', task.id);

    res.status(204).send();
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

router.put('/:id/labels', async (req, res) => {
  const { labelIds } = req.body; // Array of UUIDs

  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const workspaceId = existing.project.workspaceId;
    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        labels: {
          set: labelIds.map(id => ({ id }))
        }
      },
      include: { labels: true }
    });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: task.id,
      entityName: task.title,
      metadata: { field: 'labels' },
      io: req.io
    });

    if (req.io) req.io.to(`project:${task.projectId}`).emit('task_updated', task);
    res.json(task);
  } catch (err) {
    console.error('Update task labels error:', err);
    res.status(500).json({ error: 'Failed to update labels', details: err.message });
  }
});

module.exports = router;
