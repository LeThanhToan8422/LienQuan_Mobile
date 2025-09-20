import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Admin user
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123456";
  const adminPasswordHash = await hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: { email: adminEmail, passwordHash: adminPasswordHash, name: "Admin", role: "ADMIN" },
    });
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  // Regular user
  const userEmail = "user@example.com";
  const userPassword = "user123456";
  const userPasswordHash = await hash(userPassword, 10);

  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!existingUser) {
    await prisma.user.create({
      data: { email: userEmail, passwordHash: userPasswordHash, name: "Regular User", role: "USER" },
    });
    console.log(`Seeded regular user: ${userEmail} / ${userPassword}`);
  } else {
    console.log(`Regular user ${userEmail} already exists.`);
  }
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
