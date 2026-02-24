import type {
  CreateDeviceModel,
  DeviceModel,
  UpdateDeviceModel,
} from "@device-monitoring-service/shared";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { IDatabase } from "../../infrastructure/db/database.interface.ts";
import { and, eq, isNull } from "drizzle-orm";
import { deviceModels } from "../../infrastructure/db/schema.ts";
import { DatabaseError } from "../../shared/errors/database.error.ts";

export interface IDeviceModelRepository {
  insert(data: CreateDeviceModel): Promise<DeviceModel>;
  findAll(): Promise<DeviceModel[]>;
  findById(id: string): Promise<DeviceModel | null>;
  update(id: string, data: UpdateDeviceModel): Promise<DeviceModel>;
  softDelete(id: string): Promise<boolean>;
}

export class DeviceModelRepository implements IDeviceModelRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: PgDatabase<any>;

  constructor(database: IDatabase) {
    this.db = database.getDb();
  }

  public async insert(data: CreateDeviceModel): Promise<DeviceModel> {
    try {
      const result = await this.db
        .insert(deviceModels)
        .values(data)
        .returning();

      return result[0];
    } catch (error: unknown) {
      let message = "Database error during user creation";

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

  public async findAll(): Promise<DeviceModel[]> {
    const result = await this.db
      .select()
      .from(deviceModels)
      .where(isNull(deviceModels.deleted_at));

    return result;
  }

  public async findById(id: string): Promise<DeviceModel | null> {
    const result = await this.db
      .select()
      .from(deviceModels)
      .where(and(eq(deviceModels.id, id), isNull(deviceModels.deleted_at)))
      .limit(1);

    return result[0] || null;
  }

  public async update(
    id: string,
    data: UpdateDeviceModel,
  ): Promise<DeviceModel> {
    const result = await this.db
      .update(deviceModels)
      .set({ ...data, updated_at: new Date() })
      .where(eq(deviceModels.id, id))
      .returning();

    return result[0];
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .update(deviceModels)
      .set({ deleted_at: new Date() })
      .where(eq(deviceModels.id, id))
      .returning();

    return result[0] ? true : false;
  }
}
