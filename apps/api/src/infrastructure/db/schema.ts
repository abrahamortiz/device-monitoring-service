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

export const deviceModels = t.pgTable(
  "device_models",
  {
    pk: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    id: t.uuid().defaultRandom().notNull(),
    category: deviceCategoriesEnum().notNull(),
    name: t.varchar().notNull().unique(),
    description: t.varchar(),
    ...timestamps,
  },
  (table) => {
    return {
      idIndex: t.index("device_models_id_idx").on(table.id),
    };
  },
);

export const devices = t.pgTable(
  "devices",
  {
    pk: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    id: t.uuid().defaultRandom().notNull(),
    model_id: t
      .integer()
      .notNull()
      .references(() => deviceModels.pk),
    ip_address: t.inet().unique().notNull(),
    hw_version: t.varchar(),
    sw_version: t.varchar(),
    fw_version: t.varchar(),
    checksum: t.varchar(),
    current_status: deviceStatusEnum(),
    support_grpc: t.boolean().default(false),
    is_monitored: t.boolean().default(true),
    last_seen_at: t.timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => {
    return {
      idIndex: t.index("devices_id_idx").on(table.id),
    };
  },
);

export const deviceStatusLog = t.pgTable("device_status_log", {
  pk: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  device_id: t
    .integer()
    .notNull()
    .references(() => devices.pk),
  status: deviceStatusEnum(),
  response_time_ms: t.decimal(),
  error_message: t.varchar(),
  checked_at: t.timestamp({ withTimezone: true }),
});
