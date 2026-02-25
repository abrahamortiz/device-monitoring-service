import * as z from "zod";

const NodeEnvSchema = z
  .enum(["development", "production"])
  .default("development");

const AppConfigSchema = z.object({
  nodeEnv: NodeEnvSchema,
  port: z.int().positive().default(3000),
  host: z.string().default("0.0.0.0"),
  databaseUrl: z.string().min(1),
  devicesQty: z.int().min(1).max(246).default(4),
  maxRetries: z.int().min(1).max(5).default(3),
  timeoutMs: z.int().min(500).max(10000).default(2000),
  intervalMs: z.int().min(5000).max(300000).default(30000),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type NodeEnv = z.infer<typeof NodeEnvSchema>;

function loadConfig(): AppConfig {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    host: process.env.HOST,
    databaseUrl: process.env.DATABASE_URL,
    devicesQty: Number(process.env.DEVICES_QTY),
    maxRetries: Number(process.env.MAX_RETRIES),
    timeoutMs: Number(process.env.TIMEOUT_MS),
    intervalMs: Number(process.env.INTERVAL_MS),
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
