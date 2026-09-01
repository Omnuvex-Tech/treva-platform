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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Archives every parking unit so it drops out of the site's listings.
 *
 * Parkings arrive from Profitbase with `realEstateType: "parking"` (the alias
 * is passed through untranslated — see REAL_ESTATE_TYPE_LABELS, which only
 * names apartment/townhouse/villa/commercial). They are not sold through the
 * site, so they are archived rather than deleted: the panel still lists and
 * edits them, and un-archiving one is a single switch.
 *
 * Re-runnable. Pass `--dry` to see the count without writing anything.
 */
async function main() {
  const dryRun = process.argv.includes('--dry');

  const parkings = await prisma.unitLayout.findMany({
    where: {
      realEstateType: { equals: 'parking', mode: 'insensitive' },
      archived: false,
    },
    select: { id: true, title: true },
  });

  console.log(
    `${parkings.length} unarchived parking unit(s) found on ${process.env.DATABASE_URL?.split('@').pop()}.`,
  );

  if (dryRun) {
    for (const parking of parkings.slice(0, 10)) {
      console.log(`  - ${parking.title}`);
    }
    if (parkings.length > 10) console.log(`  … and ${parkings.length - 10} more`);
    console.log('Dry run: nothing written.');
    await prisma.$disconnect();
    return;
  }

  const result = await prisma.unitLayout.updateMany({
    where: {
      realEstateType: { equals: 'parking', mode: 'insensitive' },
      archived: false,
    },
    data: { archived: true },
  });

  console.log(`Archived ${result.count} parking unit(s).`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
