const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /comments?taskId=xxx
router.get('/', async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId required' });

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /comments
router.post('/', async (req, res) => {
  const { taskId, content } = req.body;
  if (!taskId || !content) return res.status(400).json({ error: 'taskId and content required' });

  try {
    const comment = await prisma.comment.create({
      data: { taskId, content, userId: req.user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /comments/:id
router.delete('/:id', async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Not your comment' });

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
