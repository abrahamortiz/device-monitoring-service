import type { FastifyInstance } from "fastify";
import type { App } from "./app.ts";

export class Server {
  private app: App;
  private fastifyInstance: FastifyInstance;
  private port: number;
  private host: string;

  constructor(app: App, port: number, host: string) {
    this.app = app;
    this.fastifyInstance = this.app.getInstance();
    this.port = port;
    this.host = host;
  }

  public async start(): Promise<void> {
    try {
      await this.app.init();
      this.fastifyInstance.log.info("Starting server");
      await this.fastifyInstance.listen({ port: this.port, host: this.host });
    } catch (e) {
      this.fastifyInstance.log.error(e);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    this.fastifyInstance.log.info("Shutting down server");
    await this.app.close();
    await this.fastifyInstance.close();
  }
}
