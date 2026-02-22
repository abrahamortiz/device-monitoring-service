import * as z from "zod";
import { DeviceStatusSchema } from "./device.schema.ts";

export const DeviceStatusLogSchema = z.strictObject({
  pk: z.int(),
  device_id: z.int(),
  status: DeviceStatusSchema,
  response_time_ms: z.number().nonnegative(),
  error_message: z.string(),
  checked_at: z.date(),
});

export const CreateDeviceStatusLog = DeviceStatusLogSchema.omit({
  pk: true,
});

export type DeviceStatusLog = z.infer<typeof DeviceStatusLogSchema>;
