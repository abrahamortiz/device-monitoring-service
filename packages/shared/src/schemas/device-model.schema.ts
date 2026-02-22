import * as z from "zod";

export const DeviceCategorySchema = z.enum([
  "ROUTER",
  "SWITCH",
  "CAMERA",
  "DOOR_ACCESS_SYSTEM",
]);

export const DeviceModelSchema = z.strictObject({
  pk: z.int(),
  id: z.uuid(),
  category: DeviceCategorySchema,
  name: z.string(),
  description: z.string(),
});

export type DeviceCategory = z.infer<typeof DeviceCategorySchema>;
export type DeviceModel = z.infer<typeof DeviceModelSchema>;
