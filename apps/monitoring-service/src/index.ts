import "dotenv/config";
import type { FastifyInstance } from "fastify";
import fastify from "fastify";
import { appConfig } from "./config/app.config.ts";
import { DrizzleDatabase } from "./infrastructure/db/drizzle.database.ts";
import { DeviceModelRepository } from "./modules/device/infrastructure/device-model.repository.ts";
import { DeviceRepository } from "./modules/device/infrastructure/device.repository.ts";
import { DeviceService } from "./modules/device/application/services/device.service.ts";
import { DeviceController } from "./modules/device/presentation/controllers/device.controller.ts";
import { DeviceRoutes } from "./modules/device/presentation/routes/device.route.ts";

async function bootstrap() {
  const db = new DrizzleDatabase(appConfig.databaseUrl);
  db.connect();
  const deviceModelRepository = new DeviceModelRepository(db);
  const deviceRepository = new DeviceRepository(db);

  const deviceService = new DeviceService(
    deviceRepository,
    deviceModelRepository,
  );

  const deviceController = new DeviceController(deviceService);
  const deviceRoutes = new DeviceRoutes(deviceController);

  const app: FastifyInstance = fastify({ logger: { level: "info" } });
  deviceRoutes.register(app);
  app.listen({ port: appConfig.port, host: appConfig.host });
}

await bootstrap();
