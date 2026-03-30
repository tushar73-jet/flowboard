const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /subtasks — create a subtask
router.post('/', async (req, res) => {
  const { title, taskId } = req.body;
  if (!title || !taskId) return res.status(400).json({ error: 'title and taskId required' });

  try {
    const subtask = await prisma.subtask.create({ data: { title, taskId } });
    res.status(201).json(subtask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /subtasks/:id — toggle isCompleted or rename
router.patch('/:id', async (req, res) => {
  const { isCompleted, title } = req.body;
  try {
    const subtask = await prisma.subtask.update({
      where: { id: req.params.id },
      data: { ...(title !== undefined && { title }), ...(isCompleted !== undefined && { isCompleted }) },
    });
    res.json(subtask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /subtasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.subtask.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
