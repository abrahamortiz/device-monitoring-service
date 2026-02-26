import type { PgDatabase } from "drizzle-orm/pg-core";
import type {
  CreateDevice,
  Device,
  UpdateDeviceDb,
} from "../domain/device.schema.ts";
import type { IDatabase } from "../../../infrastructure/db/database.interface.ts";
import { and, eq, isNull } from "drizzle-orm";
import { deviceModels, devices } from "../../../infrastructure/db/schema.ts";
import { DatabaseError } from "../../../shared/errors/database.error.ts";

export interface IDeviceRepository {
  insert(data: CreateDevice): Promise<Device>;
  findAll(): Promise<Device[]>;
  findMonitored(): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  findByBaseUrl(ipAddress: string): Promise<Device | null>;
  update(id: string, data: UpdateDeviceDb): Promise<Device | null>;
  softDelete(id: string): Promise<boolean>;
}

export class DeviceRepository implements IDeviceRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: PgDatabase<any>;

  constructor(database: IDatabase) {
    this.db = database.getDb();
  }

  public async insert(data: CreateDevice): Promise<Device> {
    try {
      const [result] = await this.db.insert(devices).values(data).returning();
      return result;
    } catch (error: unknown) {
      let message = "Database error during device creation";

      if (
        error &&
        typeof error === "object" &&
        "cause" in error &&
        (error.cause as { code?: string })?.code === "23505"
      ) {
        message = "Unique constraint violation";
      }

      throw new DatabaseError(message, error as Error);
    }
  }

  public async findAll(): Promise<Device[]> {
    const result = await this.db
      .select()
      .from(devices)
      .leftJoin(deviceModels, eq(devices.model_id, deviceModels.id))
      .where(isNull(devices.deleted_at));

    return result.map((row) => ({
      ...row.devices,
      model: row.device_models ?? undefined,
    }));
  }

  public async findMonitored(): Promise<Device[]> {
    const result = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.is_monitored, true), isNull(devices.deleted_at)));

    return result;
  }

  public async findById(id: string): Promise<Device | null> {
    const [result] = await this.db
      .select()
      .from(devices)
      .leftJoin(deviceModels, eq(devices.model_id, deviceModels.id))
      .where(and(eq(devices.id, id), isNull(devices.deleted_at)))
      .limit(1);

    if (result) {
      return { ...result.devices, model: result.device_models ?? undefined };
    }

    return null;
  }

  public async findByBaseUrl(baseUrl: string): Promise<Device | null> {
    const [result] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.base_url, baseUrl), isNull(devices.deleted_at)))
      .limit(1);

    return result || null;
  }

  public async update(
    id: string,
    data: UpdateDeviceDb,
  ): Promise<Device | null> {
    const [result] = await this.db
      .update(devices)
      .set(data)
      .where(eq(devices.id, id))
      .returning();

    return result || null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const [result] = await this.db
      .update(devices)
      .set({ deleted_at: new Date() })
      .where(eq(devices.id, id))
      .returning();

    return result ? true : false;
  }
}
