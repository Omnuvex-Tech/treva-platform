import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Run through the prisma:seed script so the env file is loaded.',
  );
}

const email = (process.env.ADMIN_EMAIL ?? 'info@treva.realestate')
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  throw new Error('ADMIN_PASSWORD is not defined.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Ensures the platform admin exists. Admin is never reachable through sign-up,
 * so this is the only way the account is created.
 *
 * Re-running keeps the role and active flag right but leaves an existing
 * password alone — a seed must not undo a password the admin has changed.
 */
async function main() {
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', isActive: true },
    create: {
      email,
      password: await bcrypt.hash(password!, 10),
      fullName: 'Treva Admin',
      role: 'admin',
      jobTitle: 'Platform Administrator',
    },
  });

  console.log('Admin account ready:', admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
