const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Category' AND table_schema = 'public' ORDER BY ordinal_position`.then(r => {
  console.log('Category columns:', r.map(x => x.column_name).join(', '));
  return p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = '_prisma_migrations' AND table_schema = 'public'`;
}).then(r => {
  console.log('Prisma migrations table columns:', r.map(x => x.column_name).join(', '));
  return p.$queryRaw`SELECT migration_name, applied_steps_count, status FROM "_prisma_migrations" ORDER BY finished_at`;
}).then(r => {
  r.forEach(m => console.log(`${m.migration_name}: ${m.status} (${m.applied_steps_count} steps)`));
  return p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
