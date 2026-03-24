const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  
  // 1. Create a User
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // 2. Create a Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'ADMIN',
        }
      }
    }
  });

  // 3. Create a Project
  const project = await prisma.project.create({
    data: {
      name: 'Live Board',
      workspaceId: workspace.id,
    }
  });

  // 4. Create some initial real tasks
  await prisma.task.createMany({
    data: [
      { title: 'Test actual DB connection', description: 'This is loaded from PostgreSQL', status: 'TODO', priority: 'HIGH', projectId: project.id },
      { title: 'Implement real-time updates', description: 'Add websockets maybe?', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: project.id },
      { title: 'Remove hardcoded mock data', description: 'User told me to fix hardware mock data.', status: 'DONE', priority: 'LOW', projectId: project.id },
    ]
  });

  console.log(`\n========= SUCCESS =========`);
  console.log(`Real Project created inside PostgreSQL!`);
  console.log(`Navigate to: http://localhost:3000/dashboard/board/${project.id}`);
  console.log(`===========================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
