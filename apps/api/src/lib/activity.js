const prisma = require('./prisma');

/**
 * Log a user action to the workspace activity feed.
 */
async function logActivity({ 
  workspaceId, 
  userId, 
  action, 
  entityType, 
  entityId, 
  entityName = null, 
  metadata = null 
}) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action,
        entityType,
        entityId,
        entityName,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    });

    // Optional: Real-time broadcast if passed Socket.IO can be handled later
    return log;
  } catch (err) {
    console.warn(`[ACTIVITY] Failed to log ${action}:`, err.message);
  }
}

module.exports = { logActivity };
