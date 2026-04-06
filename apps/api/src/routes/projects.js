const express = require('express');
const prisma = require('../lib/prisma');
const { checkWorkspaceRole } = require('../middleware/rbac');
const { logActivity } = require('../lib/activity');

const router = express.Router();

router.get('/', async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });

  try {
    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const projects = await prisma.project.findMany({ where: { workspaceId } });
    res.json(projects);
  } catch (err) {
    console.error('Fetch projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });

  try {
    const access = await checkWorkspaceRole(req.user.id, workspaceId, ['OWNER', 'ADMIN']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    const project = await prisma.project.create({
      data: { name, description, workspaceId }
    });

    await logActivity({
      workspaceId,
      userId: req.user.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project.id,
      entityName: project.name,
      io: req.io
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const access = await checkWorkspaceRole(req.user.id, project.workspaceId, ['OWNER']);
    if (!access.allowed) return res.status(access.status).json({ error: access.error });

    await prisma.project.delete({ where: { id: req.params.id } });

    await logActivity({
      workspaceId: project.workspaceId,
      userId: req.user.id,
      action: 'PROJECT_DELETED',
      entityType: 'PROJECT',
      entityId: req.params.id,
      entityName: project.name,
      io: req.io
    });

    res.status(204).send();
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});

module.exports = router;
