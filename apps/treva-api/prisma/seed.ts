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

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'panorama-by-elie-saab' },
    update: { type: 'object' },
    create: {
      title: 'Panorama by ELIE SAAB',
      name: 'Panorama by ELIE SAAB',
      slug: 'panorama-by-elie-saab',
      type: 'object',
    },
  });
  console.log('Category 1 created:', category1.title);

  const category2 = await prisma.category.upsert({
    where: { slug: 'treva-residences' },
    update: { type: 'object' },
    create: {
      title: 'TREVA Residences',
      name: 'TREVA Residences',
      slug: 'treva-residences',
      type: 'object',
    },
  });
  console.log('Category 2 created:', category2.title);

  // Create Layihelerimiz categories
  const layihelerimizCategories = [
    { title: 'Reportage Heights', name: 'Reportage Heights', slug: 'reportage-heights', type: 'category' },
    { title: 'Arabian Ranches', name: 'Arabian Ranches', slug: 'arabian-ranches', type: 'category' },
    { title: 'Marina Village', name: 'Marina Village', slug: 'marina-village', type: 'category' },
    { title: 'Brabus Island', name: 'Brabus Island', slug: 'brabus-island', type: 'category' },
    { title: 'Sabah Residence', name: 'Sabah Residence', slug: 'sabah-residence', type: 'category' },
    { title: 'Toronto', name: 'Toronto', slug: 'toronto', type: 'category' },
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
      { name: 'usd', title: 'US Dollar', value: 'USD' },
      { name: 'azn', title: 'Azerbaijani Manat', value: 'AZN' },
      { name: 'eur', title: 'Euro', value: 'EUR' },
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

  // Create LCD options
  const lcdOptions = [
    { value: 'LCD-1' },
    { value: 'LCD-2' },
    { value: 'LCD-3' },
  ];
  for (const opt of lcdOptions) {
    const existing = await prisma.lcdOption.findUnique({ where: { value: opt.value } });
    if (!existing) {
      await prisma.lcdOption.create({ data: opt });
      console.log(`LCD option created: ${opt.value}`);
    } else {
      console.log(`LCD option already exists: ${opt.value}`);
    }
  }

  // Create Type of building options
  const typeOfBuildingOptions = [
    { value: 'Residential' },
    { value: 'Commercial' },
    { value: 'Mixed' },
  ];
  for (const opt of typeOfBuildingOptions) {
    const existing = await prisma.typeOfBuildingOption.findUnique({ where: { value: opt.value } });
    if (!existing) {
      await prisma.typeOfBuildingOption.create({ data: opt });
      console.log(`Type of building option created: ${opt.value}`);
    } else {
      console.log(`Type of building option already exists: ${opt.value}`);
    }
  }

  // Create Property type options
  const propertyTypeOptions = [
    { value: 'Apartment' },
    { value: 'Penthouse' },
    { value: 'Studio' },
    { value: 'Duplex' },
  ];
  for (const opt of propertyTypeOptions) {
    const existing = await prisma.propertyTypeOption.findUnique({ where: { value: opt.value } });
    if (!existing) {
      await prisma.propertyTypeOption.create({ data: opt });
      console.log(`Property type option created: ${opt.value}`);
    } else {
      console.log(`Property type option already exists: ${opt.value}`);
    }
  }

  // Create Construction stage options
  const constructionStageOptions = [
    { value: 'Pre-construction' },
    { value: 'Under construction' },
    { value: 'Completed' },
  ];
  for (const opt of constructionStageOptions) {
    const existing = await prisma.constructionStageOption.findUnique({ where: { value: opt.value } });
    if (!existing) {
      await prisma.constructionStageOption.create({ data: opt });
      console.log(`Construction stage option created: ${opt.value}`);
    } else {
      console.log(`Construction stage option already exists: ${opt.value}`);
    }
  }

  // Create Sales office options
  const salesOfficeOptions = [
    { value: 'Main Office' },
    { value: 'Branch 1' },
    { value: 'Branch 2' },
  ];
  for (const opt of salesOfficeOptions) {
    const existing = await prisma.salesOfficeOption.findUnique({ where: { value: opt.value } });
    if (!existing) {
      await prisma.salesOfficeOption.create({ data: opt });
      console.log(`Sales office option created: ${opt.value}`);
    } else {
      console.log(`Sales office option already exists: ${opt.value}`);
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
