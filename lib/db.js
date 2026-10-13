import "server-only";
import pg from "pg";

// One shared connection pool for the whole app.
// In development Next.js reloads files often, so the pool is kept on globalThis
// to avoid opening a new set of connections on every reload.
const globalForDb = globalThis;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("YOUR_PASSWORD")) {
  throw new Error(
    "DATABASE_URL isn't set. Put your PostgreSQL connection string in .env.local " +
      "(see README.md, First-time setup), run npm run db:setup, then restart npm run dev."
  );
}

export const pool =
  globalForDb.krewPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.krewPool = pool;

// Run a query and get the rows back. Always pass values as params ($1, $2, ...)
// and never paste user input into the SQL text.
export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}
