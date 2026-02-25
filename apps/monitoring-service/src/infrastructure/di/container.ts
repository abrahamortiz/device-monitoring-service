import type { AppConfig } from "../../config/app.config.ts";
import type { IDeviceModelRepository } from "../../modules/device/infrastructure/device-model.repository.ts";
import type { IDeviceRepository } from "../../modules/device/infrastructure/device.repository.ts";
import type { IDeviceModelService } from "../../modules/device/application/services/device-model.service.ts";
import type { IDeviceService } from "../../modules/device/application/services/device.service.ts";
import type { IDeviceStatusLogRepository } from "../../modules/monitoring/infrastructure/device-status-log.repository.ts";
import type { IMonitoringService } from "../../modules/monitoring/application/monitoring.service.ts";
import type { IDatabase } from "../db/database.interface.ts";
import type { IHttpClient } from "../http/http-client.ts";
import { DeviceModelRepository } from "../../modules/device/infrastructure/device-model.repository.ts";
import { DeviceRepository } from "../../modules/device/infrastructure/device.repository.ts";
import { DeviceModelService } from "../../modules/device/application/services/device-model.service.ts";
import { DeviceService } from "../../modules/device/application/services/device.service.ts";
import { DrizzleDatabase } from "../db/drizzle.database.ts";
import { DeviceModelController } from "../../modules/device/presentation/controllers/device-model.controller.js";
import { DeviceController } from "../../modules/device/presentation/controllers/device.controller.js";
import { DeviceModelRoutes } from "../../modules/device/presentation/routes/device-model.route.js";
import { DeviceRoutes } from "../../modules/device/presentation/routes/device.route.js";
import { MonitoringService } from "../../modules/monitoring/application/monitoring.service.ts";
import { DeviceStatusLogRepository } from "../../modules/monitoring/infrastructure/device-status-log.repository.ts";
import { HealthCheckService } from "../../modules/monitoring/application/health-check.service.js";
import { HttpClient } from "../http/http-client.ts";
import { RetryHttpClient } from "../http/retry-http-client.ts";
import { MonitoringScheduler } from "../scheduler/monitoring.scheduler.js";

export class Container {
  private db: IDatabase;
  private deviceModelRepository!: IDeviceModelRepository;
  private deviceRepository!: IDeviceRepository;
  private logRepository!: IDeviceStatusLogRepository;
  private deviceModelService!: IDeviceModelService;
  private deviceService!: IDeviceService;
  private deviceModelController!: DeviceModelController;
  private deviceController!: DeviceController;
  private deviceModelRoutes!: DeviceModelRoutes;
  private deviceRoutes!: DeviceRoutes;
  private initialized: boolean = false;
  private healthCheckService: HealthCheckService;
  private httpClient: IHttpClient;
  private retryHttpClient: IHttpClient;
  public monitoringService!: IMonitoringService;
  public monitoringScheduler!: MonitoringScheduler;

  constructor(config: AppConfig, database?: IDatabase) {
    this.db = database || new DrizzleDatabase(config.databaseUrl);
    this.httpClient = new HttpClient();
    this.retryHttpClient = new RetryHttpClient(this.httpClient, 3);

    this.healthCheckService = new HealthCheckService(
      this.retryHttpClient,
      2000,
    );
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    await this.db.connect();

    // Repositories
    this.deviceModelRepository = new DeviceModelRepository(this.db);
    this.deviceRepository = new DeviceRepository(this.db);
    this.logRepository = new DeviceStatusLogRepository(this.db);

    // Services
    this.deviceModelService = new DeviceModelService(
      this.deviceModelRepository,
    );

    this.deviceService = new DeviceService(
      this.deviceRepository,
      this.deviceModelRepository,
    );

    this.monitoringService = new MonitoringService(
      this.deviceRepository,
      this.logRepository,
      this.healthCheckService,
    );

    this.monitoringScheduler = new MonitoringScheduler(
      this.monitoringService,
      30000,
    );

    // Controllers
    this.deviceModelController = new DeviceModelController(
      this.deviceModelService,
    );

    this.deviceController = new DeviceController(this.deviceService);

    // Routes
    this.deviceModelRoutes = new DeviceModelRoutes(this.deviceModelController);
    this.deviceRoutes = new DeviceRoutes(this.deviceController);

    this.initialized = true;
  }

  public async cleanup(): Promise<void> {
    this.monitoringScheduler.stop();
    await this.db.disconnect();
    this.initialized = false;
  }

  public getDatabase(): IDatabase {
    return this.db;
  }

  public getDeviceModelRoutes(): DeviceModelRoutes {
    this.ensureInitialized();
    return this.deviceModelRoutes;
  }

  public getDeviceRoutes(): DeviceRoutes {
    this.ensureInitialized();
    return this.deviceRoutes;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Container not initialized. Call init() first.");
    }
  }

  public static async create(
    config: AppConfig,
    database?: IDatabase,
  ): Promise<Container> {
    const container = new Container(config, database);
    await container.init();
    return container;
  }
}
