import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const envCandidates = [
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
  ".env",
  ".env.production",
];

for (const file of envCandidates) {
  const absolutePath = resolve(process.cwd(), file);

  if (existsSync(absolutePath)) {
    loadEnv({ path: absolutePath });
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node ../../scripts/run-with-env.cjs .env.development ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
