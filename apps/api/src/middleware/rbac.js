const prisma = require('../lib/prisma');

// Middleware to extract user from header (simple mock auth for now)
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
  req.user = { id: userId };
  next();
};

const checkWorkspaceOwner = async (req, res, next) => {
  const { id } = req.params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
  if (workspace.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied: Only Owners can perform this action' });
  }
  next();
};

const checkTaskAccess = async (req, res, next) => {
  const { id } = req.params;

  // Bypass for the demo board mock tasks
  if (['1', '2', '3'].includes(id)) {
    return next();
  }

  const task = await prisma.task.findUnique({ 
    where: { id },
    include: { project: { include: { workspace: true } } }
  });

  if (!task) return res.status(404).json({ error: 'Task not found' });

  // Only check restriction if it's an update (PUT/PATCH)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Is the user the assignee?
    if (task.assigneeId === req.user.id) return next();
    
    // If not assignee, is the user an Admin of the workspace?
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: task.project.workspaceId, userId: req.user.id } }
    });
    
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied: Members can only update assigned tasks' });
    }
  }
  
  next();
};

module.exports = { authenticate, checkWorkspaceOwner, checkTaskAccess };
