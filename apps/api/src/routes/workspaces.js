const express = require('express');
const prisma = require('../lib/prisma');
const { checkWorkspaceOwner } = require('../middleware/rbac');

const router = express.Router();

// Create workspace
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const workspace = await prisma.workspace.create({
      data: { 
        name, 
        description, 
        ownerId: req.user.id, 
        members: { create: { userId: req.user.id, role: 'ADMIN' } } 
      }
    });
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// List workspaces
router.get('/', async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: req.user.id } } }
    });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Delete workspace (Only Owner)
router.delete('/:id', checkWorkspaceOwner, async (req, res) => {
  try {
    await prisma.workspace.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

module.exports = router;
