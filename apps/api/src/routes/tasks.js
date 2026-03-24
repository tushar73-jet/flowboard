const express = require('express');
const prisma = require('../lib/prisma');
const { checkTaskAccess } = require('../middleware/rbac');

const router = express.Router();

// In-memory mock database to allow the demo testing to actually stick!
let mockTasks = [
  { id: "1", title: "Setup Database", description: "Spin up Postgres with Docker.", status: "DONE", priority: "HIGH", projectId: "demo-project", updatedAt: new Date() },
  { id: "2", title: "Build Canvas", description: "Create React board view.", status: "IN_PROGRESS", priority: "MEDIUM", projectId: "demo-project", updatedAt: new Date() },
  { id: "3", title: "Auth flow", description: "Implement NextAuth.", status: "TODO", priority: "HIGH", projectId: "demo-project", updatedAt: new Date() }
];

// List tasks for a project
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  try {
    if (projectId === 'demo-project') {
      return res.json(mockTasks);
    }

    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : undefined 
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId } = req.body;
  try {
    const task = await prisma.task.create({
      data: { title, description, status, priority, projectId, assigneeId }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (Assignee or Admin)
router.put('/:id', checkTaskAccess, async (req, res) => {
  const { title, description, status, priority, assigneeId } = req.body;
  
  if (['1', '2', '3'].includes(req.params.id)) {
    const taskIndex = mockTasks.findIndex((t) => t.id === req.params.id);
    if (taskIndex !== -1) {
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], title, description, status, priority, assigneeId, updatedAt: new Date() };
      return res.json(mockTasks[taskIndex]);
    }
  }

  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { title, description, status, priority, assigneeId }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
