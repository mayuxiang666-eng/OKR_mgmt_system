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
  const email = 'admin@continental.com';
  const password = 'ContinentalAdmin123!';
  const displayName = 'System Administrator';
  const role = 'admin';

  try {
    const org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!org) {
      console.error('No organization found. Please run the app first.');
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`User ${email} already exists. Updating role to ${role}...`);
      await prisma.user.update({
        where: { id: existing.id },
        data: { role, displayName, passwordHash: hashPassword(password) }
      });
      console.log('User updated successfully.');
    } else {
      await prisma.user.create({
        data: {
          email,
          displayName,
          role,
          orgId: org.id,
          passwordHash: hashPassword(password)
        }
      });
      console.log(`Administrator account created successfully:
Email: ${email}
Password: ${password}
Role: ${role}`);
    }
  } catch (error) {
    console.error('Error creating administrator:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
