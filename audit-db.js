const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'apps/api/.env' });

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.objective.count();
    console.log(`Total objectives: ${count}`);

    const last5 = await prisma.objective.findMany({
      orderBy: { id: 'desc' },
      take: 5
    });
    console.log('Last 5 objectives:', JSON.stringify(last5, null, 2));

  } catch (error) {
    console.error('Error fetching objectives:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
