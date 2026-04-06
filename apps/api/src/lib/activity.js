const prisma = require('./prisma');

async function logActivity({ 
  workspaceId, 
  userId, 
  action, 
  entityType, 
  entityId, 
  entityName = null, 
  metadata = null,
  io = null
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
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (io) {
      io.to(`workspace:${workspaceId}`).emit('workspace_activity', log);
    }

    return log;
  } catch (err) {
    console.warn(`[ACTIVITY] Failed to log ${action}:`, err.message);
  }
}

module.exports = { logActivity };
