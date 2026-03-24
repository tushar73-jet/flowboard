const express = require('express');
const prisma = require('../lib/prisma');
const { checkTaskAccess } = require('../middleware/rbac');

const router = express.Router();

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
