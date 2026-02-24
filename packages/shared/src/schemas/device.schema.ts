import * as z from "zod";

export const DeviceStatusSchema = z.enum(["UP", "DOWN", "ERROR"]);

export const DeviceSchema = z.strictObject({
  id: z.uuid(),
  model_id: z.uuid(),
  ip_address: z.ipv4(),
  hw_version: z.string().nullable(),
  sw_version: z.string().nullable(),
  fw_version: z.string().nullable(),
  checksum: z.string().nullable(),
  current_status: DeviceStatusSchema.nullable(),
  support_grpc: z.boolean().default(false),
  is_monitored: z.boolean().default(true),
  last_seen_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export const CreateDeviceSchema = DeviceSchema.omit({
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
