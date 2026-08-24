/**
 * Fake / demo data seed for local development.
 *
 * Idempotent: every write is an upsert on a unique key, so running it
 * repeatedly does not create duplicates.
 *
 * Run:  npm run seed:fake      (from apps/treva-api)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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

/** Deterministic pseudo-random so re-runs produce the same dataset. */
let seedState = 20260818;
function rnd(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
}
function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rnd() * items.length)]!;
}
function between(min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function money(min: number, max: number): number {
  return Math.round((rnd() * (max - min) + min) / 500) * 500;
}

const AZ_FIRST = ['Elvin', 'Nigar', 'Rəşad', 'Aysel', 'Kamran', 'Leyla', 'Tural', 'Günel', 'Orxan', 'Səbinə', 'Fərid', 'Aytən'];
const AZ_LAST = ['Məmmədov', 'Əliyeva', 'Hüseynov', 'Quliyeva', 'Rzayev', 'İsmayılova', 'Cəfərov', 'Kərimova', 'Abbasov', 'Nəbiyeva'];
const PROFESSIONS = ['Həkim', 'Mühəndis', 'Müəllim', 'Sahibkar', 'Hüquqşünas', 'Memar', 'Bankir', 'Proqramçı'];

function phone(i: number): string {
  const ops = ['050', '051', '055', '070', '077'];
  return `+994 ${ops[i % ops.length]} ${300 + (i * 7) % 600} ${10 + (i * 13) % 89} ${10 + (i * 17) % 89}`;
}

async function main() {
  console.log('🌱 Fake data seed başlayır...\n');

  // ── Lookup options ────────────────────────────────────────
  const unitTypes = [
    { name: 'studio', title: 'Studiya', order: 1 },
    { name: 'apartment', title: 'Mənzil', order: 2 },
    { name: 'penthouse', title: 'Penthaus', order: 3 },
    { name: 'duplex', title: 'Dupleks', order: 4 },
    { name: 'townhouse', title: 'Taunhaus', order: 5 },
  ];
  for (const u of unitTypes) {
    await prisma.unitTypeOption.upsert({ where: { name: u.name }, update: {}, create: u });
  }
  console.log(`✅ UnitTypeOption: ${unitTypes.length}`);

  const simpleOptions: Array<[string, string[]]> = [
    ['lcdOption', ['Port Baku Residence', 'Sea Breeze', 'Crescent Development', 'White City', 'Alov Towers']],
    ['typeOfBuildingOption', ['Monolit', 'Kərpic', 'Panel', 'Monolit-kərpic']],
    ['propertyTypeOption', ['Yeni tikili', 'Köhnə tikili', 'Həyət evi', 'Villa', 'Ofis']],
    ['constructionStageOption', ['Layihə', 'Təməl', 'Tikinti gedir', 'Tamamlanıb', 'İstismara verilib']],
  ];
  for (const [model, values] of simpleOptions) {
    for (const value of values) {
      await (prisma as any)[model].upsert({ where: { value }, update: {}, create: { value } });
    }
    console.log(`✅ ${model}: ${values.length}`);
  }

  const apartmentTypes = [
    { name: 'new-build', title: 'Yeni tikili' },
    { name: 'secondary', title: 'Təkrar bazar' },
    { name: 'country-house', title: 'Bağ evi' },
    { name: 'villa', title: 'Villa' },
    { name: 'office', title: 'Ofis' },
  ];
  for (const a of apartmentTypes) {
    await prisma.apartmentType.upsert({ where: { name: a.name }, update: {}, create: a });
  }
  console.log(`✅ ApartmentType: ${apartmentTypes.length}`);

  const heatingTypes = [
    { name: 'combi', title: 'Kombi' },
    { name: 'central', title: 'Mərkəzi istilik' },
    { name: 'underfloor', title: 'İsti döşəmə' },
    { name: 'ac', title: 'Kondisioner' },
  ];
  for (const h of heatingTypes) {
    await prisma.heatingTypeOption.upsert({ where: { name: h.name }, update: {}, create: h });
  }
  console.log(`✅ HeatingTypeOption: ${heatingTypes.length}`);

  // ── Locations: cities + their regions ─────────────────────
  const cityMap: Record<string, string[]> = {
    Bakı: ['Nəsimi', 'Yasamal', 'Nərimanov', 'Xətai', 'Səbail', 'Binəqədi', 'Xəzər'],
    Sumqayıt: ['1-ci mikrorayon', '2-ci mikrorayon', 'Corat'],
    Gəncə: ['Kəpəz', 'Nizami'],
  };
  let regionCount = 0;
  for (const [cityName, regions] of Object.entries(cityMap)) {
    const city = await prisma.locationOption.upsert({
      where: { type_name: { type: 'city', name: cityName } },
      update: {},
      create: { type: 'city', name: cityName, title: cityName },
    });
    for (const r of regions) {
      await prisma.locationOption.upsert({
        where: { type_name: { type: 'region', name: r } },
        update: { cityId: city.id },
        create: { type: 'region', name: r, title: r, cityId: city.id },
      });
      regionCount++;
    }
  }
  console.log(`✅ LocationOption: ${Object.keys(cityMap).length} şəhər, ${regionCount} rayon`);

  // ── Attributes ────────────────────────────────────────────
  const attributes = [
    ['pool', 'Hovuz', 'pool'], ['gym', 'İdman zalı', 'gym'], ['parking', 'Parkinq', 'parking'],
    ['security', '24/7 təhlükəsizlik', 'security'], ['playground', 'Uşaq meydançası', 'playground'],
    ['elevator', 'Lift', 'elevator'], ['garden', 'Yaşıllıq zonası', 'garden'], ['sea-view', 'Dəniz mənzərəsi', 'sea-view'],
    ['smart-home', 'Ağıllı ev', 'smart-home'], ['concierge', 'Konsyerj', 'concierge'],
    ['spa', 'SPA mərkəzi', 'spa'], ['market', 'Market', 'market'],
  ];
  const attributeIds: string[] = [];
  for (const [name, title, value] of attributes) {
    const existing = await prisma.attribute.findFirst({ where: { name } });
    const rec = existing
      ? await prisma.attribute.update({ where: { id: existing.id }, data: { title, value } })
      : await prisma.attribute.create({ data: { name, title, value, icon: `/icons/${value}.svg` } });
    attributeIds.push(rec.id);
  }
  console.log(`✅ Attribute: ${attributes.length}`);

  // ── Owners ────────────────────────────────────────────────
  const ownerIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = AZ_FIRST[i % AZ_FIRST.length]!;
    const lastName = AZ_LAST[i % AZ_LAST.length]!;
    // pick() must run on every pass, not only when creating — otherwise a
    // re-run advances the PRNG a different number of times and every later
    // random value shifts.
    const profession = pick(PROFESSIONS);
    const existing = await prisma.owner.findFirst({ where: { firstName, lastName } });
    const rec = existing ?? (await prisma.owner.create({
      data: { firstName, lastName, profession, phoneNumber: phone(i) },
    }));
    ownerIds.push(rec.id);
  }
  console.log(`✅ Owner: ${ownerIds.length}`);

  const statusOptions = await prisma.statusOption.findMany();
  const heatingIds = (await prisma.heatingTypeOption.findMany()).map((h) => h.id);
  const unitTypeIds = (await prisma.unitTypeOption.findMany()).map((u) => u.id);
  const currencies = await prisma.currency.findMany();

  // ── Categories (projects) ─────────────────────────────────
  const projects = [
    { name: 'Treva Residences', city: 'Bakı', region: 'Səbail', brand: 'TREVA Development' },
    { name: 'Sea Breeze Marina', city: 'Bakı', region: 'Xəzər', brand: 'Sea Breeze' },
    { name: 'Port Baku Towers', city: 'Bakı', region: 'Nəsimi', brand: 'Pasha Construction' },
    { name: 'White City Park', city: 'Bakı', region: 'Xətai', brand: 'White City' },
    { name: 'Crescent Heights', city: 'Bakı', region: 'Nərimanov', brand: 'Crescent Development' },
    { name: 'Sumqayıt Green Valley', city: 'Sumqayıt', region: 'Corat', brand: 'Green Valley MMC' },
  ];
  const categoryIds: string[] = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]!;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        title: p.name,
        name: p.name,
        slug,
        objectType: 'residential',
        status: 'active',
        propertyName: p.name,
        currency: 'AZN',
        city: p.city,
        region: p.region,
        area: `${between(3, 25)} ha`,
        locationTitle: `${p.city}, ${p.region}`,
        locationGoogleMapsUrl: 'https://maps.google.com/?q=Baku',
        developerBrand: p.brand,
        website: `https://${slug}.example.az`,
        salesDepartment: 'Satış şöbəsi',
        phoneNumber: phone(i),
        coverImage: `/uploads/demo/project-${i + 1}-cover.jpg`,
        bannerImage: `/uploads/demo/project-${i + 1}-banner.jpg`,
        image: `/uploads/demo/project-${i + 1}.jpg`,
        documents: [{ name: 'Layihə broşürü', url: `/uploads/demo/${slug}-brochure.pdf` }],
        fedLaw214: i % 2 === 0,
        type: 'object',
      },
    });
    categoryIds.push(cat.id);
  }
  console.log(`✅ Category (layihə): ${categoryIds.length}`);

  // ── Houses (buildings) ────────────────────────────────────
  const houseIds: string[] = [];
  for (let i = 0; i < 14; i++) {
    const categoryId = categoryIds[i % categoryIds.length]!;
    const project = projects[i % projects.length]!;
    const block = String.fromCharCode(65 + (i % 4));
    const title = `${project.name} — ${block} blok`;
    const slug = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blok-${block.toLowerCase()}-${i + 1}`;
    const floors = between(9, 28);
    const totalArea = between(55, 210);
    const house = await prisma.house.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        name: title,
        slug,
        seoTitle: `${title} | TREVA`,
        seoDescription: `${project.name} layihəsində ${block} blok — ${floors} mərtəbəli müasir yaşayış binası.`,
        seoKeywords: 'mənzil, yeni tikili, Bakı, TREVA',
        floor: between(1, floors),
        number: i + 1,
        unitCode: `${block}-${100 + i}`,
        rooms: between(1, 5),
        totalArea,
        internalArea: Math.round(totalArea * 0.88),
        balconyArea: between(4, 18),
        prices: { AZN: money(180000, 950000), USD: money(105000, 560000) },
        completionYear: between(2026, 2029),
        numberOfFloors: { total: floors, residential: floors - 1 },
        similarApartmentIds: [],
        mainImage: { url: `/uploads/demo/house-${i + 1}.jpg`, alt: title },
        coverImage: { url: `/uploads/demo/house-${i + 1}-cover.jpg`, alt: title },
        gallery: [1, 2, 3].map((n) => ({ url: `/uploads/demo/house-${i + 1}-${n}.jpg`, alt: `${title} ${n}` })),
        documents: [{ name: 'Plan', url: `/uploads/demo/${slug}-plan.pdf` }],
        location: { lat: 40.37 + rnd() * 0.1, lng: 49.83 + rnd() * 0.1 },
        categoryId,
        status: 'available',
        statusOptionId: pick(statusOptions).id,
        typeOfBuilding: pick(['Monolit', 'Kərpic', 'Monolit-kərpic']),
        constructionStage: pick(['Tikinti gedir', 'Tamamlanıb', 'Təməl']),
        description: `${project.name} layihəsinin ${block} bloku ${floors} mərtəbədən ibarətdir. Yerüstü parkinq, uşaq meydançası və 24/7 təhlükəsizlik xidməti mövcuddur.`,
        ownerId: pick(ownerIds),
        heatingTypeIds: [pick(heatingIds)],
        attributeIds: [attributeIds[i % attributeIds.length]!, attributeIds[(i + 3) % attributeIds.length]!],
        locationTitle: `${project.city}, ${project.region}`,
        locationGoogleMapsUrl: 'https://maps.google.com/?q=Baku',
        street: `${pick(['Nizami', 'Xaqani', 'Füzuli', 'Neftçilər'])} küçəsi`,
        houseNumber: String(between(1, 90)),
        deadlineForCommissioning: `Q${between(1, 4)} ${between(2026, 2029)}`,
        salesOffice: `${project.city}, ${project.region}, satış ofisi`,
        landCadastralNumber: `${between(1000, 9999)}-${between(100, 999)}`,
        showroomAvailability: pick(['Var', 'Yoxdur']),
        archived: false,
      },
    });
    houseIds.push(house.id);
  }
  console.log(`✅ House (blok): ${houseIds.length}`);

  // ── Unit layouts ──────────────────────────────────────────
  let layoutCount = 0;
  for (let i = 0; i < 48; i++) {
    const categoryId = categoryIds[i % categoryIds.length]!;
    const houseId = houseIds[i % houseIds.length]!;
    // Derived from i, not rnd() — the slug is the upsert key, so it must stay
    // identical across runs no matter what the PRNG is doing.
    const rooms = (i % 4) + 1;
    const totalArea = 38 + rooms * (16 + (i % 11));
    const floor = between(1, 24);
    const slug = `plan-${rooms}otaqli-${totalArea}m2-${i + 1}`;
    const title = `${rooms} otaqlı ${totalArea} m² planlaşdırma`;
    await prisma.unitLayout.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        name: title,
        slug,
        seoTitle: `${title} | TREVA`,
        seoDescription: `${rooms} otaqlı, ${totalArea} m² sahəli mənzil planı.`,
        floor,
        number: 100 + i,
        unitCode: `U-${1000 + i}`,
        rooms,
        entrance: `${between(1, 4)}-ci giriş`,
        totalArea,
        internalArea: Math.round(totalArea * 0.9),
        balconyArea: between(3, 14),
        prices: { AZN: money(140000, 880000), USD: money(82000, 517000) },
        completionYear: between(2026, 2029),
        numberOfFloors: { total: between(12, 28) },
        similarApartmentIds: [],
        mainImage: { url: `/uploads/demo/layout-${i + 1}.jpg`, alt: title },
        gallery: [1, 2].map((n) => ({ url: `/uploads/demo/layout-${i + 1}-${n}.jpg`, alt: `${title} ${n}` })),
        documents: [],
        categoryId,
        houseId,
        unitTypeOptionId: pick(unitTypeIds),
        realEstateType: pick(['residential', 'commercial']),
        status: pick(['available', 'reserved', 'sold']),
        statusOptionId: pick(statusOptions).id,
        typeOfBuilding: pick(['Monolit', 'Kərpic']),
        constructionStage: pick(['Tikinti gedir', 'Tamamlanıb']),
        description: `Geniş qonaq otağı, ${rooms > 1 ? `${rooms - 1} yataq otağı` : 'studiya tipli planlaşdırma'}, ayrıca mətbəx və balkon.`,
        heatingTypeIds: [pick(heatingIds)],
        attributeIds: [attributeIds[(i + 1) % attributeIds.length]!],
        archived: false,
      },
    });
    layoutCount++;
  }
  console.log(`✅ UnitLayout (plan): ${layoutCount}`);

  // ── Requests ──────────────────────────────────────────────
  let requestCount = 0;
  for (let i = 0; i < 18; i++) {
    const fullName = `${AZ_FIRST[i % AZ_FIRST.length]} ${AZ_LAST[(i + 2) % AZ_LAST.length]}`;
    const phoneNumber = phone(i + 20);
    const existing = await prisma.request.findFirst({ where: { fullName, phoneNumber } });
    if (!existing) {
      await prisma.request.create({ data: { fullName, phoneNumber } });
    }
    requestCount++;
  }
  console.log(`✅ Request (müraciət): ${requestCount}`);

  // ── Apartments (resale) + prices ──────────────────────────
  const aptTypes = await prisma.apartmentType.findMany();
  let aptCount = 0;
  let priceCount = 0;
  for (let i = 0; i < 26; i++) {
    // Derived from i, not rnd() — see the UnitLayout note above.
    const rooms = (i % 5) + 1;
    const area = 42 + rooms * (14 + (i % 11));
    const cityName = pick(Object.keys(cityMap));
    const region = pick(cityMap[cityName]!);
    const slug = `menzil-${rooms}otaq-${area}m2-${i + 1}`;
    const title = `${cityName}, ${region} — ${rooms} otaqlı ${area} m² mənzil`;
    const priceTotal = money(95000, 720000);
    const apt = await prisma.apartment.upsert({
      where: { slug },
      update: {},
      create: {
        name: title,
        title,
        slug,
        description: `${region} rayonunda təmirli, ${rooms} otaqlı mənzil. Metro və məktəbə yaxın, infrastruktur tam formalaşıb.`,
        seoTitle: `${title} | TREVA`,
        seoDescription: `${cityName} şəhəri ${region} rayonunda ${area} m² sahəli mənzil satılır.`,
        seoKeywords: 'mənzil satılır, Bakı, təkrar bazar',
        image: `/uploads/demo/apt-${i + 1}.jpg`,
        coverImage: `/uploads/demo/apt-${i + 1}-cover.jpg`,
        gallery: [1, 2, 3].map((n) => ({ url: `/uploads/demo/apt-${i + 1}-${n}.jpg`, alt: `${title} ${n}` })),
        priceTotal,
        priceByArea: Math.round(priceTotal / area),
        roomCount: rooms,
        area,
        grossArea: Math.round(area * 1.08),
        floorFrom: between(1, 12),
        floorTo: between(13, 22),
        bathroomCount: rooms > 2 ? 2 : 1,
        purpose: pick(['sale', 'rent']),
        region,
        city: cityName,
        locationTitle: `${cityName}, ${region}`,
        locationGoogleMapsUrl: 'https://maps.google.com/?q=Baku',
        renovation: pick(['Təmirli', 'Təmirsiz', 'Əla təmirli']),
        mortgage: rnd() > 0.4,
        extract: rnd() > 0.3,
        buildingAge: between(0, 25),
        furnishing: pick(['Mebelli', 'Mebelsiz', 'Qismən mebelli']),
        ceilingHeight: Number((2.7 + rnd() * 0.8).toFixed(2)),
        kitchenSize: between(8, 22),
        wallMaterial: pick(['Monolit', 'Kərpic', 'Panel']),
        heatingTypeIds: [pick(heatingIds)],
        attributeIds: [attributeIds[i % attributeIds.length]!, attributeIds[(i + 5) % attributeIds.length]!],
        requestIds: [],
        status: 'active',
        archived: false,
        apartmentTypeId: pick(aptTypes).id,
        ownerId: pick(ownerIds),
      },
    });
    aptCount++;

    for (const cur of currencies) {
      const rate = cur.value === 'USD' ? 0.588 : cur.value === 'EUR' ? 0.54 : 1;
      await prisma.apartmentPrice.upsert({
        where: { apartmentId_currencyId: { apartmentId: apt.id, currencyId: cur.id } },
        update: {},
        create: {
          apartmentId: apt.id,
          currencyId: cur.id,
          priceTotal: Math.round(priceTotal * rate),
          priceByArea: Math.round((priceTotal * rate) / area),
        },
      });
      priceCount++;
    }
  }
  console.log(`✅ Apartment: ${aptCount}  (ApartmentPrice: ${priceCount})`);

  // ── Keep Category counters consistent ─────────────────────
  for (const categoryId of categoryIds) {
    const housesCount = await prisma.house.count({ where: { categoryId } });
    const propertiesCount = await prisma.unitLayout.count({ where: { categoryId } });
    const reservedCount = await prisma.unitLayout.count({ where: { categoryId, status: 'reserved' } });
    const soldCount = await prisma.unitLayout.count({ where: { categoryId, status: 'sold' } });
    await prisma.category.update({
      where: { id: categoryId },
      data: { housesCount, propertiesCount, reservedCount, soldCount },
    });
  }
  console.log('✅ Category sayğacları yeniləndi');

  console.log('\n🎉 Fake data hazırdır.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
