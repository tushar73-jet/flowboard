const prisma = require('../lib/prisma');
const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');

// Proper Clerk Auth Middleware Wrapper
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
      // Sync Clerk User ID to our local Postgres database
      // Using findUnique then check to avoid upsert race conditions in some Prisma versions
      let user = await prisma.user.findUnique({ where: { id: userId } });

      // Fetch real name + email from Clerk on every request
      // (cheap — Clerk SDK caches internally)
      let clerkName = null;
      let clerkEmail = null;
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        clerkName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || null;
        clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress || null;
      } catch (e) {
        console.warn('[AUTH] Could not fetch Clerk profile:', e.message);
      }

      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: clerkEmail || `clerk-${userId}@flowboard-user.com`,
              name: clerkName || 'Flowboard User'
            }
          });
        } catch (createErr) {
          if (createErr.code === 'P2002') {
            user = await prisma.user.findUnique({ where: { id: userId } });
          } else {
            throw createErr;
          }
        }
      } else if (clerkName && (user.name === 'Verified Clerk User' || user.name === 'Flowboard User' || !user.name)) {
        // Update placeholder name with real Clerk name
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            name: clerkName,
            ...(clerkEmail && { email: clerkEmail })
          }
        });
      }

      if (!user) {
        console.warn(`[AUTH] User synchronization failed for userId: ${userId}`);
        return res.status(401).json({ error: 'User synchronization failed' });
      }

      req.user = user;
      console.log(`[AUTH] User authenticated: ${user.id} (${user.email})`);
      next();
    } catch (err) {
      console.error("[AUTH] Middleware Error:", err);
      res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
  });
};

/**
 * RBAC Middleware to check roles within a workspace
 * @param {string[]} allowedRoles - List of roles that are allowed (OWNER, ADMIN, MEMBER)
 */
const requireRole = (allowedRoles = ['OWNER', 'ADMIN', 'MEMBER']) => {
  return async (req, res, next) => {
    const workspaceId = (req.params && req.params.workspaceId) || (req.body && req.body.workspaceId) || (req.query && req.query.workspaceId);
    
    if (!workspaceId) {
      // If we can't find workspaceId in params/body/query, we might be on a sub-resource
      // but for simplicity, we expect it to be provided or resolved beforehand.
      return res.status(400).json({ error: 'Workspace ID is required for role verification' });
    }

    try {
      console.log(`[RBAC] Checking role for user ${req.user.id} in workspace ${workspaceId}`);
      
      // First check if user is the Owner of the workspace
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

      // If not owner, check WorkspaceMember table
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
      req.membership = membership; // Inject membership info
      next();
    } catch (err) {
      console.error("[RBAC] Error during role verification:", err);
      res.status(500).json({ error: 'Internal server error during role verification', details: err.message });
    }
  };
};

/**
 * Helper: check if a user has the required role in a workspace.
 * Returns { allowed: true, role: 'OWNER'|'ADMIN'|'MEMBER' } or { allowed: false, status, error }
 * Call this INSIDE route handlers (after workspaceId is known).
 */
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
