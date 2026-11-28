import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, AccountType } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Passwords come from .env (ADMIN_PASSWORD, DEMO_PASSWORD, DEMO_PIN).
  // The fallbacks are for local demo data only.
  const adminPassword = process.env.ADMIN_PASSWORD ?? "trellisdemo";
  const demoPassword = process.env.DEMO_PASSWORD ?? "trellisdemo";
  const demoPin = process.env.DEMO_PIN ?? "1234";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);
  const transactionPinHash = await bcrypt.hash(demoPin, 12);

  const users: [string, string, Role, string][] = [
    ["admin@trellis.bank", "Alex Morgan", Role.admin, adminPasswordHash],
    ["staff@trellis.bank", "Jordan Lee", Role.staff, demoPasswordHash],
    ["jamie@trellis.bank", "Jamie Parker", Role.customer, demoPasswordHash],
  ];

  for (const [email, fullName, role, passwordHash] of users) {
    await prisma.user.upsert({
      where: { email },
      // update does NOT touch passwordHash / transactionPinHash,
      // so re-running the seed never resets a changed password.
      update: { fullName, role },
      create: { email, fullName, role, passwordHash, transactionPinHash },
    });
  }

  const customer = await prisma.user.findUniqueOrThrow({
    where: { email: "jamie@trellis.bank" },
  });

  const accounts: [string, AccountType, string][] = [
    ["4821", AccountType.savings, "24680.45"],
    ["1098", AccountType.savings, "18240.20"],
    ["7734", AccountType.business, "5420.10"],
  ];

  for (const [accountNumber, accountType, balance] of accounts) {
    await prisma.account.upsert({
      where: { accountNumber },
      // balance is not overwritten on re-run either
      update: { customerId: customer.id, accountType },
      create: {
        customerId: customer.id,
        accountNumber,
        accountType,
        balance,
        dailyLimit: "10000",
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());