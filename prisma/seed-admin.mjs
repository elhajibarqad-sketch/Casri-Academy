import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD with a password of at least 12 characters.");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

const admin = await prisma.user.upsert({
  where: { email },
  update: {
    role: "ADMIN",
    passwordHash: await bcrypt.hash(password, 12),
  },
  create: {
    email,
    name: "Casri Admin",
    role: "ADMIN",
    passwordHash: await bcrypt.hash(password, 12),
    profile: { create: {} },
  },
});

console.log(`Admin ready: ${admin.email}`);
await prisma.$disconnect();
