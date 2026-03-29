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

// Add/Invite Member to Workspace by Email (Only Owner or Admin)
router.post('/:workspaceId/members', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId } = req.params;
  const { email, role = 'MEMBER' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // 1. Find user by email in our local Prisma DB
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found in Flowboard. They must sign in at least once before being added to a workspace.' 
      });
    }

    // 2. Upsert membership
    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id }
      },
      update: { role },
      create: { workspaceId, userId: user.id, role }
    });

    res.json({ ...member, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Add Member Error:", err);
    res.status(500).json({ error: 'Failed to add member', details: err.message });
  }
});

// Remove Member (Only Owner or Admin, and can't remove yourself if Owner)
router.delete('/:workspaceId/members/:userId', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId, userId } = req.params;

  try {
    // Check if trying to remove the owner
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace.ownerId === userId) {
      return res.status(403).json({ error: 'Cannot remove the workspace owner.' });
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
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

// Get current user's role in a workspace
router.get('/:workspaceId/my-role', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    if (workspace.ownerId === req.user.id) return res.json({ role: 'OWNER' });
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: req.user.id } }
    });
    return res.json({ role: membership?.role || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get role' });
  }
});

module.exports = router;
