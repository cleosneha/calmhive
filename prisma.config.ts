// prisma.config.ts (at project root)
import "dotenv/config"; // This loads your .env file into process.env

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"), // Throws clear error if missing
  },
});
