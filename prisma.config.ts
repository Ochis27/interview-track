import dotenv from "dotenv";
import { resolve } from "path";
import { defineConfig, env } from "prisma/config";

dotenv.config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});