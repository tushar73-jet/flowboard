const prisma = require('../lib/prisma');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Proper Clerk Auth Middleware Wrapper
const authenticate = (req, res, next) => {
  // Use the official Clerk middleware to verify the JWT
  ClerkExpressRequireAuth()(req, res, async (err) => {
    if (err) {
      console.error("Clerk Authentication Error:", err);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired Clerk token' });
    }

    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing Clerk user ID' });
    }

    try {
      // Sync Clerk User ID to our local Postgres database
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { 
          id: userId, 
          email: `clerk-${userId}@flowboard-user.com`, 
          name: 'Verified Clerk User' 
        }
      });
      
      // Inject user context for subsequent handlers
      req.user = { id: userId };
      next();
    } catch (syncErr) {
      console.error("Database User Sync Failure:", syncErr);
      res.status(500).json({ error: 'Internal server error during authentication sync' });
    }
  });
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
