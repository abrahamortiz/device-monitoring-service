import type { FastifyInstance } from "fastify";
import type { DeviceModelController } from "../controllers/device-model.controller.ts";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as z from "zod";
import {
  CreateDeviceModelSchema,
  DeviceModelResponseSchema,
  UpdateDeviceModelSchema,
} from "../../domain/device-model.schema.ts";
import { ErrorResponseSchema } from "../../../../infrastructure/http/swagger.plugin.ts";

const tags = ["Device Models"];

const idParam = z.object({
  id: z.uuid().describe("Device model ID"),
});

const errorResponses = {
  400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
  404: { description: "Device model not found", content: { "application/json": { schema: ErrorResponseSchema } } },
  500: { description: "Internal server error", content: { "application/json": { schema: ErrorResponseSchema } } },
};

export class DeviceModelRoutes {
  private controller: DeviceModelController;

  constructor(controller: DeviceModelController) {
    this.controller = controller;
  }

  public register(app: FastifyInstance): void {
    app.register(
      async (models) => {
        const router = models.withTypeProvider<ZodTypeProvider>();

        router.post("/", {
          schema: {
            tags,
            summary: "Create a new device model",
            body: CreateDeviceModelSchema,
            response: {
              201: { description: "Device model created", content: { "application/json": { schema: DeviceModelResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.createModel,
        });

        router.get("/", {
          schema: {
            tags,
            summary: "List all device models",
            response: {
              200: {
                description: "List of device models",
                content: { "application/json": { schema: z.array(DeviceModelResponseSchema) } },
              },
              ...errorResponses,
            },
          },
          handler: this.controller.getAllModels,
        });

        router.get("/:id", {
          schema: {
            tags,
            summary: "Get a device model by ID",
            params: idParam,
            response: {
              200: { description: "Device model found", content: { "application/json": { schema: DeviceModelResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.getModel,
        });

        router.patch("/:id", {
          schema: {
            tags,
            summary: "Update a device model",
            params: idParam,
            body: UpdateDeviceModelSchema,
            response: {
              200: { description: "Device model updated", content: { "application/json": { schema: DeviceModelResponseSchema } } },
              ...errorResponses,
            },
          },
          handler: this.controller.updateModel,
        });

        router.delete("/:id", {
          schema: {
            tags,
            summary: "Delete a device model",
            params: idParam,
            response: {
              200: { description: "Device model deleted" },
              ...errorResponses,
            },
          },
          handler: this.controller.deleteModel,
        });
      },
      { prefix: "models" },
    );
  }
}
