import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import { appConfig } from "../../config/app.config.ts";
import * as schema from "./schema.ts";

const generateIpAddresses = (qty: number): string[] =>
  Array.from({ length: qty }, (_, i) => `192.168.1.${10 + i}`);

const main = async () => {
  const { databaseUrl, devicesQty } = appConfig;

  if (!databaseUrl) {
    console.error("Database URL not found");
    process.exit(1);
  }

  const db = drizzle(databaseUrl);

  console.info("Seeding database...");

  try {
    await reset(db, schema);

    const models = await db
      .insert(schema.deviceModels)
      .values([
        {
          category: "ROUTER",
          name: "U7 Pro XGS",
          description: "10G, 8-stream WiFi 7 AP",
        },
        {
          category: "SWITCH",
          name: "Pro XG 8 PoE",
          description:
            "Compact, Professional-grade 8-port Etherlighting™ switch",
        },
        {
          category: "CAMERA",
          name: "G6 Pro Dome",
          description: "A sleek IK10-rated vandal-resistant design",
        },
        {
          category: "DOOR_ACCESS_SYSTEM",
          name: "G3 Starter Kit Pro",
          description:
            "Complete entry and exit control for a single door with two readers",
        },
      ])
      .onConflictDoNothing()
      .returning();

    const modelIds = models.map((model) => model.id);
    const now = new Date();

    await seed(db, { devices: schema.devices }).refine((f) => ({
      devices: {
        count: devicesQty,
        columns: {
          model_id: f.valuesFromArray({ values: modelIds }),
          hw_version: f.default({ defaultValue: null }),
          sw_version: f.default({ defaultValue: null }),
          fw_version: f.default({ defaultValue: null }),
          checksum: f.default({ defaultValue: null }),
          current_status: f.default({ defaultValue: null }),
          support_grpc: f.default({ defaultValue: false }),
          ip_address: f.valuesFromArray({
            values: generateIpAddresses(devicesQty),
            isUnique: true,
          }),
          is_monitored: f.default({ defaultValue: true }),
          last_seen_at: f.default({ defaultValue: null }),
          created_at: f.default({ defaultValue: now }),
          updated_at: f.default({ defaultValue: now }),
          deleted_at: f.default({ defaultValue: null }),
        },
      },
    }));

    console.info("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await db.$client.end();
  }
};

main();
