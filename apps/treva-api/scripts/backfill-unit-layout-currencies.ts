import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envCandidates = [
  process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development',
  '../.env',
  '../.env.production',
];

for (const relativePath of envCandidates) {
  const absolutePath = resolve(__dirname, relativePath);
  if (existsSync(absolutePath)) loadEnv({ path: absolutePath });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Check .env.development or .env.production.');
}

// 1 AZN = 0.59 USD, 1 USD = 0.87 EUR
const USD_TO_AZN = 1 / 0.59;
const USD_TO_EUR = 0.87;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const allLayouts = await prisma.unitLayout.findMany({
    select: { id: true, prices: true },
  });
  const layouts = allLayouts.filter((layout) => {
    const usd = Number((layout.prices as Record<string, number> | null)?.USD);
    return Number.isFinite(usd) && usd > 0;
  });

  console.log(`Found ${layouts.length} unit layouts with a USD price (of ${allLayouts.length} total).`);

  let updated = 0;
  for (const layout of layouts) {
    const prices = (layout.prices as Record<string, number>) || {};
    const usd = Number(prices.USD);
    if (!Number.isFinite(usd) || usd <= 0) continue;

    const azn = Math.round(usd * USD_TO_AZN);
    const eur = Math.round(usd * USD_TO_EUR);

    await prisma.unitLayout.update({
      where: { id: layout.id },
      data: { prices: { ...prices, AZN: azn, EUR: eur } },
    });
    updated++;
  }

  console.log(`Updated ${updated} unit layouts with AZN/EUR prices.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
