const express = require('express');
const prisma = require('../lib/prisma');
const { requireRole } = require('../middleware/rbac');
const { logActivity } = require('../lib/activity');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
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

router.get('/:workspaceId', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: { members: true, projects: true }
        }
      }
    });

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    // Check if user is owner or member
    if (workspace.ownerId !== req.user.id) {
      const isMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: req.user.id } }
      });
      if (!isMember) return res.status(403).json({ error: 'Access denied' });
    }

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

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

router.post('/:workspaceId/members', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId } = req.params;
  const { email, role = 'MEMBER' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found in Flowboard. They must sign in at least once before being added to a workspace.' 
      });
    }

    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id }
      },
      update: { role },
      create: { workspaceId, userId: user.id, role }
    });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'MEMBER_ADDED',
      entityType: 'USER',
      entityId: user.id,
      entityName: user.name || user.email,
      metadata: { role },
      io: req.io
    });

    res.json({ ...member, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Add Member Error:", err);
    res.status(500).json({ error: 'Failed to add member', details: err.message });
  }
});

router.delete('/:workspaceId/members/:userId', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId, userId } = req.params;

  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace.ownerId === userId) {
      return res.status(403).json({ error: 'Cannot remove the workspace owner.' });
    }

    const existingMember = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'MEMBER_REMOVED',
      entityType: 'USER',
      entityId: userId,
      entityName: existingMember?.name || existingMember?.email,
      io: req.io
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

router.get('/:workspaceId/activity', requireRole(['OWNER', 'ADMIN', 'MEMBER']), async (req, res) => {
  const { workspaceId } = req.params;
  const { cursor, limit = 50 } = req.query;
  const take = parseInt(limit);

  try {
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      include: { 
        user: { select: { name: true, email: true } }
      },
      orderBy: { id: 'desc' }, // Consistent sorting for cursor
      take: take,
      ...(cursor && { skip: 1, cursor: { id: cursor } })
    });
    res.json({
      activities,
      nextCursor: activities.length === take ? activities[activities.length - 1].id : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

router.patch('/:workspaceId', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description } = req.body;
  if (!name && description === undefined) return res.status(400).json({ error: 'Nothing to update' });
  try {
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });
    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

router.delete('/:workspaceId', requireRole(['OWNER']), async (req, res) => {
  try {
    await prisma.workspace.delete({ where: { id: req.params.workspaceId } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

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
