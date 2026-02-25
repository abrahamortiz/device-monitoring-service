import type { FastifyInstance } from "fastify";
import type { NodeEnv } from "../../config/app.config.ts";
import type { Container } from "../di/container.ts";
import { fastify } from "fastify";

export class App {
  private container: Container;
  private fastifyInstance: FastifyInstance;

  constructor(container: Container, nodeEnv: NodeEnv) {
    this.container = container;

    this.fastifyInstance = fastify({
      logger:
        nodeEnv === "production"
          ? { level: "error" }
          : {
              level: "info",
              transport: {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
                },
              },
            },
    });
  }

  public async registerRoutes() {
    this.fastifyInstance.get("/health", async () => ({ ok: true }));
    this.container.getDeviceModelRoutes().register(this.fastifyInstance);
    this.container.getDeviceRoutes().register(this.fastifyInstance);
  }

  public async init() {
    await this.registerRoutes();
  }

  public async close() {
    await this.fastifyInstance.close();
  }

  public getInstance(): FastifyInstance {
    return this.fastifyInstance;
  }

  public getContainer(): Container {
    return this.container;
  }
}
