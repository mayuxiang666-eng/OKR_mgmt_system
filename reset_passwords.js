const { PrismaClient } = require('@prisma/client');
const { randomBytes, pbkdf2Sync } = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const iterations = 210000;
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha512').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

async function main() {
  const defaultPassword = '123456';
  const hashed = hashPassword(defaultPassword);

  try {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users. Resetting passwords to "${defaultPassword}"...`);

    let count = 0;
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashed }
      });
      count++;
    }

    console.log(`Successfully reset passwords for ${count} users.`);
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
