import "dotenv/config";
import { appConfig } from "./config/app.config.ts";
import { Container } from "./infrastructure/di/container.ts";
import { App } from "./infrastructure/http/app.ts";
import { Server } from "./infrastructure/http/server.ts";

async function bootstrap() {
  const container = await Container.create(appConfig);
  const app = new App(container, appConfig.nodeEnv);
  const server = new Server(app, appConfig.port, appConfig.host);

  await server.start();
  await container.monitoringService.executeMonitoringCycle();
  container.monitoringScheduler.start();

  const shutdown = async () => {
    await server.stop();
    await container.cleanup();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
