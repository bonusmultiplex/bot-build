import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be defined");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: 'sqlite',
  dbCredentials: {
    accountId: process.env.CF_ACCOUNT_ID || '',
    databaseId: process.env.CF_DATABASE_ID || '',
    token: process.env.CF_API_TOKEN || ''
  }
});
