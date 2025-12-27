import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Configure connection pool for Supabase Session mode
const client = postgres(connectionString, {
  prepare: false,
  max: 1, // Limit to 1 connection to avoid pool exhaustion in Supabase Session mode
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
