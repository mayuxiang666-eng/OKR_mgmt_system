const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'apps/api/.env' });

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Fetching table list...');
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Tables in okr_db:', JSON.stringify(tables, null, 2));

    const columns = await prisma.$queryRaw`DESCRIBE Objective`.catch(() => 'Objective table not found');
    console.log('Objective columns:', JSON.stringify(columns, null, 2));

  } catch (error) {
    console.error('Error fetching database info:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
