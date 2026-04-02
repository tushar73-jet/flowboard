const prisma = require('../lib/prisma');
const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');

const authenticate = (req, res, next) => {
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
      let emailFromClerk = `${userId}@flowboard-user.com`;
      let nameFromClerk = 'Flowboard User';
      
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
          emailFromClerk = clerkUser.emailAddresses[0].emailAddress;
        }
        nameFromClerk = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || nameFromClerk;
      } catch (err) {
        console.warn('[AUTH] Failed to fetch Clerk user details:', err.message);
      }

      let user = await prisma.user.upsert({
        where: { id: userId },
        update: {
          email: emailFromClerk,
          name: nameFromClerk
        },
        create: {
          id: userId,
          email: emailFromClerk,
          name: nameFromClerk
        }
      });

      req.user = user;
      console.log(`[AUTH] User authenticated: ${user.id} (${user.email})`);
      next();
    } catch (err) {
      console.error("[AUTH] Middleware Error:", err);
      res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
  });
};

const requireRole = (allowedRoles = ['OWNER', 'ADMIN', 'MEMBER']) => {
  return async (req, res, next) => {
    const workspaceId = (req.params && req.params.workspaceId) || (req.body && req.body.workspaceId) || (req.query && req.query.workspaceId);
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required for role verification' });
    }

    try {
      console.log(`[RBAC] Checking role for user ${req.user.id} in workspace ${workspaceId}`);
      
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId }
      });

      if (!workspace) {
        console.warn(`[RBAC] Workspace ${workspaceId} not found`);
        return res.status(404).json({ error: 'Workspace not found' });
      }

      if (workspace.ownerId === req.user.id) {
        console.log(`[RBAC] User ${req.user.id} is OWNER of workspace ${workspaceId}`);
        return next();
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id
          }
        }
      });

      if (!membership) {
        console.warn(`[RBAC] User ${req.user.id} is NOT a member of workspace ${workspaceId}`);
        return res.status(403).json({ error: 'Forbidden: You are not a member of this workspace' });
      }

      if (!allowedRoles.includes(membership.role)) {
        console.warn(`[RBAC] User ${req.user.id} has role ${membership.role}, but allowed roles are: ${allowedRoles}`);
        return res.status(403).json({ error: `Forbidden: This action requires one of these roles: ${allowedRoles.join(', ')}` });
      }

      console.log(`[RBAC] User ${req.user.id} granted access with role ${membership.role}`);
      req.membership = membership;
      next();
    } catch (err) {
      console.error("[RBAC] Error during role verification:", err);
      res.status(500).json({ error: 'Internal server error during role verification', details: err.message });
    }
  };
};

async function checkWorkspaceRole(userId, workspaceId, allowedRoles = ['OWNER', 'ADMIN', 'MEMBER']) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return { allowed: false, status: 404, error: 'Workspace not found' };

  if (workspace.ownerId === userId) {
    return { allowed: true, role: 'OWNER' };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });

  if (!membership) return { allowed: false, status: 403, error: 'Forbidden: not a workspace member' };
  if (!allowedRoles.includes(membership.role)) {
    return { allowed: false, status: 403, error: `Forbidden: requires ${allowedRoles.join(' or ')}` };
  }

  return { allowed: true, role: membership.role };
}

module.exports = { authenticate, requireRole, checkWorkspaceRole };
