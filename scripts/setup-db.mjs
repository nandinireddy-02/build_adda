// Creates the Krew database (if needed), its tables, and starter problems.
// Run with:  npm run db:setup
// It reads DATABASE_URL from .env.local. Running it again is safe.

import { readFile } from "node:fs/promises";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  console.error(
    "Couldn't find .env.local in this folder.\n" +
      "Create a file named .env.local next to package.json containing:\n\n" +
      "  DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/buildadda\n\n" +
      "Replace YOUR_PASSWORD with your PostgreSQL password, then run npm run db:setup again."
  );
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing from .env.local. See .env.example for the format.");
  process.exit(1);
}
if (url.includes("YOUR_PASSWORD")) {
  console.error(
    "Replace YOUR_PASSWORD in .env.local with the password you set when you installed PostgreSQL."
  );
  process.exit(1);
}

// If the database itself doesn't exist yet, connect to the built-in "postgres"
// database and create it.
async function createDatabaseIfMissing() {
  const target = new URL(url);
  const dbName = decodeURIComponent(target.pathname.slice(1));
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error(`Unexpected database name "${dbName}".`);
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(`create database "${dbName}"`);
    console.log(`Created the database "${dbName}".`);
  } finally {
    await client.end();
  }
}

async function connect() {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    return client;
  } catch (error) {
    if (error.code === "3D000") {
      await createDatabaseIfMissing();
      const retry = new pg.Client({ connectionString: url });
      await retry.connect();
      return retry;
    }
    throw error;
  }
}

function explain(error) {
  if (error.code === "28P01") return "The password in .env.local is wrong.";
  if (error.code === "ECONNREFUSED") return "PostgreSQL isn't running, or isn't on the host and port in .env.local.";
  if (error.code === "ENOTFOUND") return "The database host in .env.local can't be found. Check the address.";
  return error.message;
}

let client;
try {
  client = await connect();
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  const seed = await readFile(new URL("../db/seed.sql", import.meta.url), "utf8");
  await client.query(schema);
  console.log("Tables are ready.");
  await client.query(seed);
  const { rows } = await client.query("select count(*)::int as n from problems");
  console.log(`Starter problems added. The database now has ${rows[0].n} problems.`);
  console.log("All set. Run npm run dev and open http://localhost:3000");
} catch (error) {
  console.error("Database setup failed:", explain(error));
  process.exitCode = 1;
} finally {
  await client?.end();
}
