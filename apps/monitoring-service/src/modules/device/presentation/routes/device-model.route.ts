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
  400: ErrorResponseSchema.describe("Validation error"),
  404: ErrorResponseSchema.describe("Not found"),
  500: ErrorResponseSchema.describe("Internal server error"),
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
              201: DeviceModelResponseSchema.describe("Device model created"),
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
              200: z
                .array(DeviceModelResponseSchema)
                .describe("List of device models"),
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
              200: DeviceModelResponseSchema.describe("Device model found"),
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
              200: DeviceModelResponseSchema.describe("Device model updated"),
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
              200: z.object({}).describe("Device model deleted"),
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
