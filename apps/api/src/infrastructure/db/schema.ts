import * as t from "drizzle-orm/pg-core";

export const deviceCategoriesEnum = t.pgEnum("device_categories", [
  "ROUTER",
  "SWITCH",
  "CAMERA",
  "DOOR_ACCESS_SYSTEM",
]);

export const deviceStatusEnum = t.pgEnum("device_statuses", [
  "UP",
  "DOWN",
  "ERROR",
]);

export const timestamps = {
  created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  deleted_at: t.timestamp({ withTimezone: true }),
};

export const deviceModels = t.pgTable("device_models", {
  id: t.uuid().primaryKey().defaultRandom(),
  category: deviceCategoriesEnum().notNull(),
  name: t.varchar().notNull().unique(),
  description: t.varchar(),
  ...timestamps,
});

export const devices = t.pgTable("devices", {
  id: t.uuid().primaryKey().defaultRandom(),
  model_id: t
    .uuid()
    .notNull()
    .references(() => deviceModels.id),
  ip_address: t.inet().unique().notNull(),
  hw_version: t.varchar(),
  sw_version: t.varchar(),
  fw_version: t.varchar(),
  checksum: t.varchar(),
  current_status: deviceStatusEnum(),
  support_grpc: t.boolean().notNull().default(false),
  is_monitored: t.boolean().notNull().default(true),
  last_seen_at: t.timestamp({ withTimezone: true }),
  ...timestamps,
});

export const deviceStatusLog = t.pgTable("device_status_log", {
  id: t.uuid().primaryKey().defaultRandom(),
  device_id: t
    .uuid()
    .notNull()
    .references(() => devices.id),
  status: deviceStatusEnum(),
  response_time_ms: t.decimal(),
  error_message: t.varchar(),
  checked_at: t.timestamp({ withTimezone: true }),
});
