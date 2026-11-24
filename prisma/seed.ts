import { PrismaClient, Role, AccountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("trellisdemo", 12);
  const transactionPinHash = await bcrypt.hash("1234", 12);
  const users: [string, string, Role][] = [
    ["admin@trellis.bank", "Alex Morgan", Role.admin],
    ["staff@trellis.bank", "Jordan Lee", Role.staff],
    ["jamie@trellis.bank", "Jamie Parker", Role.customer],
  ];

  for (const [email, fullName, role] of users) {
    await prisma.user.upsert({
      where: { email },
      update: { fullName, role, passwordHash, transactionPinHash },
      create: { email, fullName, role, passwordHash, transactionPinHash },
    });
  }

  const customer = await prisma.user.findUniqueOrThrow({ where: { email: "jamie@trellis.bank" } });
  const accounts: [string, AccountType, string][] = [
    ["4821", AccountType.savings, "24680.45"],
    ["1098", AccountType.savings, "18240.20"],
    ["7734", AccountType.business, "5420.10"],
  ];
  for (const [accountNumber, accountType, balance] of accounts) {
    await prisma.account.upsert({
      where: { accountNumber },
      update: { customerId: customer.id, accountType, balance },
      create: { customerId: customer.id, accountNumber, accountType, balance, dailyLimit: "10000" },
    });
  }
}

main().finally(() => prisma.$disconnect());
