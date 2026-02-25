import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";

export const deviceCategoriesEnum = t.pgEnum("device_categories", [
  "ROUTER",
  "SWITCH",
  "CAMERA",
  "DOOR_ACCESS_SYSTEM",
]);

export const deviceStatusEnum = t.pgEnum("device_statuses", [
  "UNKNOWN",
  "ONLINE",
  "OFFLINE",
  "DEGRADED",
]);

export const timestamps = {
  created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  deleted_at: t.timestamp({ withTimezone: true }),
};

export const deviceModels = t.pgTable(
  "device_models",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    category: deviceCategoriesEnum().notNull(),
    name: t.varchar().notNull(),
    description: t.varchar(),
    ...timestamps,
  },
  (table) => {
    return {
      uniqueNamePerActiveModel: t
        .uniqueIndex("device_models_name_unique")
        .on(table.name)
        .where(sql`${table.deleted_at} IS NULL`),
      deletedAtIndex: t
        .index("device_models_deleted_at_idx")
        .on(table.deleted_at),
    };
  },
);

export const devices = t.pgTable(
  "devices",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    model_id: t
      .uuid()
      .notNull()
      .references(() => deviceModels.id),
    base_url: t.varchar().notNull(),
    hw_version: t.varchar(),
    sw_version: t.varchar(),
    fw_version: t.varchar(),
    checksum: t.varchar(),
    latest_status: deviceStatusEnum().default("UNKNOWN"),
    is_monitored: t.boolean().notNull().default(true),
    last_seen_at: t.timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => {
    return {
      uniqueIpAddressPerActiveDevice: t
        .uniqueIndex("devices_base_url_unique")
        .on(table.base_url)
        .where(sql`${table.deleted_at} IS NULL`),
      deletedAtIndex: t.index("devices_deleted_at_idx").on(table.deleted_at),
    };
  },
);

export const deviceStatusLog = t.pgTable(
  "device_status_log",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    device_id: t
      .uuid()
      .notNull()
      .references(() => devices.id),
    status: deviceStatusEnum().notNull(),
    response_time_ms: t.integer().notNull(),
    error_message: t.varchar(),
    checked_at: t.timestamp({ withTimezone: true }).notNull(),
  },
  (table) => {
    return {
      deviceIdIndex: t
        .index("device_status_log_device_id_idx")
        .on(table.device_id),
    };
  },
);
