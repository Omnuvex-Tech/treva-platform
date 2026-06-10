import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@treva.az' },
    update: {},
    create: {
      email: 'admin@treva.az',
      password: adminPassword,
      name: 'Admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'panorama-by-elie-saab' },
    update: {},
    create: {
      title: 'Panorama by ELIE SAAB',
      name: 'Panorama by ELIE SAAB',
      slug: 'panorama-by-elie-saab',
    },
  });
  console.log('Category 1 created:', category1.title);

  const category2 = await prisma.category.upsert({
    where: { slug: 'treva-residences' },
    update: {},
    create: {
      title: 'TREVA Residences',
      name: 'TREVA Residences',
      slug: 'treva-residences',
    },
  });
  console.log('Category 2 created:', category2.title);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
