import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envCandidates = [
  process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development',
  '../.env',
  '../.env.production',
];

for (const relativePath of envCandidates) {
  const absolutePath = resolve(__dirname, relativePath);

  if (existsSync(absolutePath)) {
    config({ path: absolutePath });
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Check .env.development or .env.production.');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  await prisma.admin.deleteMany({
    where: { email: { not: 'info@treva.realestate' } },
  });

  const adminPassword = await bcrypt.hash('treva12345@', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'info@treva.realestate' },
    update: {},
    create: {
      email: 'info@treva.realestate',
      password: adminPassword,
      name: 'Admin',
    },
  });
  console.log('Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
