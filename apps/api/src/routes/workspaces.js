const express = require('express');
const prisma = require('../lib/prisma');
const { requireRole } = require('../middleware/rbac');

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
        // The owner is automatically an ADMIN in the membership table too
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });
    res.status(201).json(workspace);
  } catch (err) {
    console.error("Workspace Create Error:", err);
    res.status(500).json({ error: 'Failed to create workspace', details: err.message });
  }
});

// List workspaces where the user is a member or owner
router.get('/', async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        _count: {
          select: { members: true, projects: true }
        }
      }
    });
    res.json(workspaces);
  } catch (err) {
    console.error("Workspaces Fetch Error:", err);
    res.status(500).json({ error: 'Failed to fetch workspaces', details: err.message });
  }
});

// Add Member to Workspace (Only Owner or Admin)
router.post('/:workspaceId/members', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId } = req.params;
  const { userId, role = 'MEMBER' } = req.body;

  try {
    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId }
      },
      update: { role },
      create: { workspaceId, userId, role }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Delete workspace (Only Owner)
router.delete('/:workspaceId', requireRole(['OWNER']), async (req, res) => {
  try {
    await prisma.workspace.delete({ where: { id: req.params.workspaceId } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

// List Workspace Members (Any Member)
router.get('/:workspaceId/members', requireRole(['OWNER', 'ADMIN', 'MEMBER']), async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, email: true, name: true } } }
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
