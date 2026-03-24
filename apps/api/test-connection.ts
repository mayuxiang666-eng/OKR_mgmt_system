import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log(`Connecting to: ${process.env.DATABASE_URL}`);
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    const objectiveCount = await prisma.objective.count();
    console.log(`Current Objective count: ${objectiveCount}`);

    const lastObjective = await prisma.objective.findFirst({
      orderBy: { createdAt: 'desc' }
    }).catch(() => null);

    if (lastObjective) {
      console.log(`Last objective title: ${lastObjective.title}`);
      console.log(`Created at: ${lastObjective.createdAt}`);
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
