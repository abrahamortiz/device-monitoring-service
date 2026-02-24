import type { PgDatabase } from "drizzle-orm/pg-core";
import type { IDatabase } from "./database.interface.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export class DrizzleDatabase implements IDatabase {
  private pool: Pool | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: PgDatabase<any> | null = null;
  private databaseUrl: string;

  constructor(databaseUrl: string) {
    this.databaseUrl = databaseUrl;
  }

  public async connect(): Promise<void> {
    if (this.db) {
      return;
    }

    this.pool = new Pool({
      connectionString: this.databaseUrl,
      ssl: false,
    });

    this.db = drizzle(this.pool, { casing: "snake_case" });
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getDb(): PgDatabase<any> {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }

    return this.db;
  }
}
