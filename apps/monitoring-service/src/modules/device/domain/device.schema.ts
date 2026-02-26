import * as z from "zod";
import { DeviceModelSchema } from "./device-model.schema.ts";

export const DeviceStatusSchema = z.enum([
  "UNKNOWN",
  "ONLINE",
  "OFFLINE",
  "DEGRADED",
]);

export const DeviceSchema = z.strictObject({
  id: z.uuid(),
  model_id: z.uuid(),
  base_url: z.url(),
  hw_version: z.string().nullable(),
  sw_version: z.string().nullable(),
  fw_version: z.string().nullable(),
  checksum: z.string().nullable(),
  latest_status: DeviceStatusSchema.nullable(),
  is_monitored: z.boolean().default(true),
  last_seen_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
  model: DeviceModelSchema.optional(),
});

export const CreateDeviceSchema = DeviceSchema.omit({
  id: true,
  hw_version: true,
  sw_version: true,
  fw_version: true,
  checksum: true,
  latest_status: true,
  last_seen_at: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  model: true,
});

export const UpdateDeviceDbSchema = DeviceSchema.omit({
  id: true,
  created_at: true,
  deleted_at: true,
  model: true,
}).partial();

export const UpdateDeviceSchema = CreateDeviceSchema.partial();

export const DeviceResponseSchema = z.object({
  id: z.uuid(),
  base_url: z.url(),
  hw_version: z.string().nullable(),
  sw_version: z.string().nullable(),
  fw_version: z.string().nullable(),
  checksum: z.string().nullable(),
  latest_status: DeviceStatusSchema.nullable(),
  is_monitored: z.boolean(),
  last_seen_at: z.date().nullable(),
  model: z.string().optional(),
  category: z.string().optional(),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export type UpdateDeviceDb = z.infer<typeof UpdateDeviceDbSchema>;
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
export type DeviceResponse = z.infer<typeof DeviceResponseSchema>;
