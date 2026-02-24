import type {
  CreateDevice,
  Device,
  UpdateDevice,
} from "@device-monitoring-service/shared";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { IDatabase } from "../../../infrastructure/db/database.interface.ts";
import { and, eq, isNull } from "drizzle-orm";
import { devices } from "../../../infrastructure/db/schema.ts";
import { DatabaseError } from "../../../shared/errors/database.error.ts";

export interface IDeviceRepository {
  insert(data: CreateDevice): Promise<Device>;
  findAll(): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  update(id: string, data: UpdateDevice): Promise<Device | null>;
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
      const [device] = await this.db.insert(devices).values(data).returning();
      return device;
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
      .where(isNull(devices.deleted_at));

    return result;
  }

  public async findById(id: string): Promise<Device | null> {
    const result = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, id), isNull(devices.deleted_at)))
      .limit(1);

    return result[0] || null;
  }

  public async update(id: string, data: UpdateDevice): Promise<Device | null> {
    const result = await this.db
      .update(devices)
      .set({ ...data, updated_at: new Date() })
      .where(eq(devices.id, id))
      .returning();

    return result[0] || null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .update(devices)
      .set({ deleted_at: new Date() })
      .where(eq(devices.id, id))
      .returning();

    return result[0] ? true : false;
  }
}
