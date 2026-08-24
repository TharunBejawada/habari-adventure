// apps/api/src/seed.ts
import { prisma } from "@repo/database";
import * as auth from "./utils/auth";

async function main() {
  const email = "admin@habariadventure.com";
  const password = "HabariAdmin2026!"; 

  const hashedPassword = await auth.hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      firstName: "Super",
      lastName: "Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded:", admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());