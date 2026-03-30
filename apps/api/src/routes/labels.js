const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /labels?workspaceId=xxx
router.get('/', async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  try {
    const labels = await prisma.label.findMany({ where: { workspaceId }, orderBy: { name: 'asc' } });
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /labels
router.post('/', async (req, res) => {
  const { workspaceId, name, color } = req.body;
  if (!workspaceId || !name) return res.status(400).json({ error: 'workspaceId and name required' });

  try {
    const label = await prisma.label.create({
      data: { workspaceId, name, color: color || '#6366f1' },
    });
    res.status(201).json(label);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /labels/:id — rename or recolor
router.patch('/:id', async (req, res) => {
  const { name, color } = req.body;
  try {
    const label = await prisma.label.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(color && { color }) },
    });
    res.json(label);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /labels/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.label.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
