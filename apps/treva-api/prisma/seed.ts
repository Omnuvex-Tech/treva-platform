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
    update: { order: 5 },
    create: {
      title: 'Panorama by ELIE SAAB',
      name: 'Panorama by ELIE SAAB',
      slug: 'panorama-by-elie-saab',
      order: 5,
    },
  });
  console.log('Category 1 created:', category1.title);

  const category2 = await prisma.category.upsert({
    where: { slug: 'treva-residences' },
    update: { order: 6 },
    create: {
      title: 'TREVA Residences',
      name: 'TREVA Residences',
      slug: 'treva-residences',
      order: 6,
    },
  });
  console.log('Category 2 created:', category2.title);

  // Create Layihelerimiz categories
  const layihelerimizCategories = [
    { title: 'Reportage Heights', name: 'Reportage Heights', slug: 'reportage-heights', order: 0 },
    { title: 'Arabian Ranches', name: 'Arabian Ranches', slug: 'arabian-ranches', order: 1 },
    { title: 'Marina Village', name: 'Marina Village', slug: 'marina-village', order: 2 },
    { title: 'Brabus Island', name: 'Brabus Island', slug: 'brabus-island', order: 3 },
    { title: 'Sabah Residence', name: 'Sabah Residence', slug: 'sabah-residence', order: 4 },
    { title: 'Toronto', name: 'Toronto', slug: 'toronto', order: 7 },
  ];

  for (const cat of layihelerimizCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log('Category created:', cat.title);
    } else {
      console.log('Category already exists:', cat.title);
    }
  }

  // Create default currencies
  const currencies = [
    { name: 'US Dollar', value: 'USD', order: 0 },
    { name: 'Azerbaijani Manat', value: 'AZN', order: 1 },
    { name: 'Euro', value: 'EUR', order: 2 },
  ];

  for (const currency of currencies) {
    const existing = await prisma.currency.findUnique({
      where: { value: currency.value },
    });
    if (!existing) {
      await prisma.currency.create({ data: currency });
      console.log(`Currency created: ${currency.value}`);
    } else {
      console.log(`Currency already exists: ${currency.value}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
