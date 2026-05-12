import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local before running queries.",
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  _db = drizzle({ client: sql, schema, casing: "snake_case" }) as DB;
  return _db;
}

/**
 * Lazy Drizzle client. The connection is created on first access so the app
 * can build without `DATABASE_URL` set (e.g. during `next build` previews).
 */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop, receiver) {
    const real = getDb() as any;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
export * as dbSchema from "./schema";
