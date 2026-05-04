import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL. Set it in .env.local before using database queries.");
}

const client = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema });
