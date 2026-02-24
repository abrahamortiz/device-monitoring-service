import * as z from "zod";
import { DeviceStatusSchema } from "./device.schema.ts";

export const DeviceStatusLogSchema = z.strictObject({
  id: z.uuid(),
  device_id: z.uuid(),
  status: DeviceStatusSchema,
  response_time_ms: z.int().nonnegative(),
  error_message: z.string(),
  checked_at: z.date(),
});

export const CreateDeviceStatusLog = DeviceStatusLogSchema.omit({
  id: true,
});

export type DeviceStatusLog = z.infer<typeof DeviceStatusLogSchema>;
