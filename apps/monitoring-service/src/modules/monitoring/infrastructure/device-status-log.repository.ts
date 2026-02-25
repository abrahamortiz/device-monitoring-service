import type { PgDatabase } from "drizzle-orm/pg-core";
import type { IDatabase } from "../../../infrastructure/db/database.interface.ts";
import type {
  CreateDeviceStatusLog,
  DeviceStatusLog,
} from "../domain/device-status-log.schema.ts";
import { eq } from "drizzle-orm";
import { DatabaseError } from "../../../shared/errors/database.error.ts";
import { deviceStatusLog } from "../../../infrastructure/db/schema.ts";

export interface IDeviceStatusLogRepository {
  insert(data: CreateDeviceStatusLog): Promise<DeviceStatusLog>;
  findByDevice(id: string): Promise<DeviceStatusLog[]>;
}

export class DeviceStatusLogRepository implements IDeviceStatusLogRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: PgDatabase<any>;

  constructor(database: IDatabase) {
    this.db = database.getDb();
  }

  public async insert(data: CreateDeviceStatusLog): Promise<DeviceStatusLog> {
    try {
      const [deviceStatus] = await this.db
        .insert(deviceStatusLog)
        .values(data)
        .returning();

      return deviceStatus;
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

  public async findByDevice(id: string): Promise<DeviceStatusLog[]> {
    const result = await this.db
      .select()
      .from(deviceStatusLog)
      .where(eq(deviceStatusLog.device_id, id));

    return result;
  }
}
