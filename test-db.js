const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'apps/api/.env' });

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    const objectiveCount = await prisma.objective.count();
    console.log(`Current Objective count: ${objectiveCount}`);

    const lastObjective = await prisma.objective.findFirst({
      orderBy: { id: 'desc' }
    });

    if (lastObjective) {
      console.log('Last objective found:', JSON.stringify(lastObjective, null, 2));
    } else {
      console.log('No objectives found in the database.');
    }

  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
