import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (!process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL must be set. Database will not be initialized.");
  pool = undefined;
  db = undefined;
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
