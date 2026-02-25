import type { DeviceModelResponse } from "./device-model.schema.ts";
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
  ip_address: z.ipv4(),
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
  checksum: true,
  latest_status: true,
  last_seen_at: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  model: true,
});

export const UpdateDeviceSchema = DeviceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  model: true,
}).partial();

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;

export type DeviceResponse = {
  id: string;
  ip_address: string;
  hw_version: string | null;
  sw_version: string | null;
  fw_version: string | null;
  checksum: string | null;
  latest_status: DeviceStatus | null;
  is_monitored: boolean;
  last_seen_at: Date | null;
  model?: DeviceModelResponse;
};
