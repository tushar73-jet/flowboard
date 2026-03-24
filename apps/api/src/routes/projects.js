const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Create project
router.post('/', async (req, res) => {
  const { name, description, workspaceId } = req.body;
  try {
    const project = await prisma.project.create({
      data: { name, description, workspaceId }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// List projects in a workspace
router.get('/', async (req, res) => {
  const { workspaceId } = req.query;
  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

module.exports = router;
