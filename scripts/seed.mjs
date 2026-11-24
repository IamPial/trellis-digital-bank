import postgres from "postgres";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const sql = postgres(databaseUrl, { ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined });

const passwordHash = await bcrypt.hash("trellisdemo", 12);
const users = [
  ["admin@trellis.bank", "Alex Morgan", "admin"],
  ["staff@trellis.bank", "Jordan Lee", "staff"],
  ["jamie@trellis.bank", "Jamie Parker", "customer"],
];

for (const [email, fullName, role] of users) {
  await sql`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES (${email}, ${passwordHash}, ${fullName}, ${role})
    ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role
  `;
}

const customer = await sql`SELECT id FROM users WHERE email = 'jamie@trellis.bank'`;
for (const [number, type, balance] of [["4821","savings",24680.45],["1098","savings",18240.20],["7734","business",5420.10]]) {
  await sql`
    INSERT INTO accounts (customer_id, account_number, account_type, balance)
    VALUES (${customer[0].id}, ${number}, ${type}, ${balance})
    ON CONFLICT (account_number) DO UPDATE
    SET customer_id = EXCLUDED.customer_id, account_type = EXCLUDED.account_type, balance = EXCLUDED.balance
  `;
}

await sql.end();
console.log("Demo users and accounts seeded.");
