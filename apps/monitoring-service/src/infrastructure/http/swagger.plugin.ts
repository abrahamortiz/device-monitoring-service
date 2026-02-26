import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import * as z from "zod";

export const ErrorResponseSchema = z.object({
  error: z.string().describe("Machine-readable error code"),
  message: z.string().describe("Human-readable error description"),
  details: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Optional additional error details"),
});

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Device Monitoring Service API",
        description:
          "REST API for managing device models and devices in the monitoring service.",
        version: "1.0.0",
      },
      tags: [
        {
          name: "Device Models",
          description: "Endpoints for managing device models",
        },
        {
          name: "Devices",
          description: "Endpoints for managing monitored devices",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}
