import type { PgDatabase } from "drizzle-orm/pg-core";

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDb(): PgDatabase<any>;
}
