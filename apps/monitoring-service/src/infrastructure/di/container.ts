import type { AppConfig } from "../../config/app.config.ts";
import type { IDeviceModelRepository } from "../../modules/device/infrastructure/device-model.repository.ts";
import type { IDeviceRepository } from "../../modules/device/infrastructure/device.repository.ts";
import type { IDeviceService } from "../../modules/device/application/services/device.service.ts";
import type { IDatabase } from "../db/database.interface.ts";
import { DeviceModelRepository } from "../../modules/device/infrastructure/device-model.repository.ts";
import { DeviceRepository } from "../../modules/device/infrastructure/device.repository.ts";
import { DeviceService } from "../../modules/device/application/services/device.service.ts";
import { DrizzleDatabase } from "../db/drizzle.database.ts";
import { DeviceController } from "../../modules/device/presentation/controllers/device.controller.js";
import { DeviceRoutes } from "../../modules/device/presentation/routes/device.route.js";

export class Container {
  private db: IDatabase;
  private deviceModelRepository!: IDeviceModelRepository;
  private deviceRepository!: IDeviceRepository;
  private deviceService!: IDeviceService;
  private deviceController!: DeviceController;
  private deviceRoutes!: DeviceRoutes;
  private initialized: boolean = false;

  constructor(config: AppConfig, database?: IDatabase) {
    this.db = database || new DrizzleDatabase(config.databaseUrl);
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    await this.db.connect();

    // Repositories
    this.deviceModelRepository = new DeviceModelRepository(this.db);
    this.deviceRepository = new DeviceRepository(this.db);

    // Services
    this.deviceService = new DeviceService(
      this.deviceRepository,
      this.deviceModelRepository,
    );

    // Controllers
    this.deviceController = new DeviceController(this.deviceService);

    // Routes
    this.deviceRoutes = new DeviceRoutes(this.deviceController);

    this.initialized = true;
  }

  public async cleanup(): Promise<void> {
    await this.db.disconnect();
    this.initialized = false;
  }

  public getDatabase(): IDatabase {
    return this.db;
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
