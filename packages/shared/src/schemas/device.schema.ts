import * as z from "zod";

export const DeviceStatusSchema = z.enum(["UP", "DOWN", "ERROR"]);

export const DeviceSchema = z.strictObject({
  pk: z.int(),
  id: z.uuid(),
  model_id: z.int(),
  ip_address: z.ipv4(),
  hw_version: z.string(),
  sw_version: z.string(),
  fw_version: z.string(),
  checksum: z.string(),
  current_status: DeviceStatusSchema,
  support_grpc: z.boolean(),
  is_monitored: z.boolean(),
  last_seen_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export const CreateDeviceSchema = DeviceSchema.omit({
  pk: true,
  id: true,
  checksum: true,
  current_status: true,
  last_seen_at: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateDeviceSchema = CreateDeviceSchema.optional();

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
