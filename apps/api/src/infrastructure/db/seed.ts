import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import * as schema from "./schema.ts";

const main = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("Database URL not found");
    process.exit(1);
  }

  const db = drizzle(dbUrl);

  console.info("Seeding database...");

  try {
    await reset(db, schema);

    await db
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
      .onConflictDoNothing();

    await seed(db, { devices: schema.devices }).refine((f) => ({
      devices: {
        count: 15,
        columns: {
          model_id: f.int({ minValue: 1, maxValue: 4 }),
          hw_version: f.valuesFromArray({
            values: ["1.0.0", "1.0.0", "1.0.1", "2.0.0"],
          }),
          sw_version: f.valuesFromArray({
            values: ["1.0.0", "1.0.0", "1.0.1", "2.0.0"],
          }),
          fw_version: f.valuesFromArray({
            values: ["1.0.0", "1.0.0", "1.0.1", "2.0.0"],
          }),
          ip_address: f.valuesFromArray({
            values: [
              "192.168.1.10",
              "192.168.1.11",
              "192.168.1.12",
              "192.168.1.13",
              "192.168.1.14",
              "192.168.1.15",
              "192.168.1.16",
              "192.168.1.17",
              "192.168.1.18",
              "192.168.1.19",
              "192.168.1.20",
              "192.168.1.21",
              "192.168.1.22",
              "192.168.1.23",
              "192.168.1.24",
            ],
          }),
          is_monitored: f.valuesFromArray({ values: [true] }),
          // last_seen_at: f.default(null)
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
