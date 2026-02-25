import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { appConfig } from "./src/config/app.config.ts";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/infrastructure/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: appConfig.databaseUrl,
  },
});
