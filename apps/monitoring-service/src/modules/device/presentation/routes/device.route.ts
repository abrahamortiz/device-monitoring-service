import type { FastifyInstance } from "fastify";
import type { DeviceController } from "../controllers/device.controller.ts";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as z from "zod";
import {
  CreateDeviceSchema,
  DeviceResponseSchema,
  UpdateDeviceSchema,
} from "../../domain/device.schema.ts";
import { DeviceStatusLogSchema } from "../../../../modules/monitoring/domain/device-status-log.schema.ts";
import { ErrorResponseSchema } from "../../../../infrastructure/http/swagger.plugin.ts";

const tags = ["Devices"];

const idParam = z.object({
  id: z.uuid().describe("Device ID"),
});

const errorResponses = {
  400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
  404: { description: "Device not found", content: { "application/json": { schema: ErrorResponseSchema } } },
  500: { description: "Internal server error", content: { "application/json": { schema: ErrorResponseSchema } } },
};

export class DeviceRoutes {
  private controller: DeviceController;

  constructor(controller: DeviceController) {
    this.controller = controller;
  }

  public register(app: FastifyInstance): void {
    app.register(
      async (devices) => {
        const router = devices.withTypeProvider<ZodTypeProvider>();

        router.post("/", {
          schema: {
            tags,
            summary: "Register a new device",
            body: CreateDeviceSchema,
            response: {
              201: { description: "Device created", content: { "application/json": { schema: DeviceResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.createDevice,
        });

        router.get("/", {
          schema: {
            tags,
            summary: "List all devices",
            response: {
              200: {
                description: "List of devices",
                content: { "application/json": { schema: z.array(DeviceResponseSchema) } },
              },
              ...errorResponses,
            },
          },
          handler: this.controller.getAllDevices,
        });

        router.get("/:id", {
          schema: {
            tags,
            summary: "Get a device by ID",
            params: idParam,
            response: {
              200: { description: "Device found", content: { "application/json": { schema: DeviceResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.getDevice,
        });

        router.get("/:id/status-history", {
          schema: {
            tags,
            summary: "Get device status history",
            description: "Returns the monitoring status log for a specific device.",
            params: idParam,
            response: {
              200: {
                description: "Device status history",
                content: {
                  "application/json": {
                    schema: z.array(DeviceStatusLogSchema),
                  },
                },
              },
              ...errorResponses,
            },
          },
          handler: this.controller.getDeviceLog,
        });

        router.patch("/:id", {
          schema: {
            tags,
            summary: "Update a device",
            params: idParam,
            body: UpdateDeviceSchema,
            response: {
              200: { description: "Device updated", content: { "application/json": { schema: DeviceResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.updateDevice,
        });

        router.delete("/:id", {
          schema: {
            tags,
            summary: "Delete a device",
            params: idParam,
            response: {
              200: { description: "Device deleted" },
              ...errorResponses,
            },
          },
          handler: this.controller.deleteDevice,
        });
      },
      { prefix: "devices" },
    );
  }
}
