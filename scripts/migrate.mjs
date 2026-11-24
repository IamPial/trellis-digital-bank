import fs from "node:fs";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const sql = postgres(databaseUrl, { ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined });
const schema = fs.readFileSync(new URL("../database/schema.sql", import.meta.url), "utf8");
await sql.unsafe(schema);
await sql.end();
console.log("Database schema applied.");
