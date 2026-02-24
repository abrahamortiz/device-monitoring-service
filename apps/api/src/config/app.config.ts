import * as z from "zod";

const AppConfigSchema = z.object({
  nodeEnv: z.enum(["development", "production"]).default("development"),
  port: z.int().positive().default(3000),
  host: z.string().default("0.0.0.0"),
  databaseUrl: z.string().min(1),
  devicesQty: z.int().min(1).max(246).default(25),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

function loadConfig(): AppConfig {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    host: process.env.HOST,
    databaseUrl: process.env.DATABASE_URL,
    devicesQty: Number(process.env.DEVICES_QTY),
  };

  const result = AppConfigSchema.safeParse(config);

  if (!result.success) {
    console.error("Invalid configuration:");
    console.error(result.error.issues);
    process.exit(1);
  }

  return result.data;
}

export const appConfig = loadConfig();
