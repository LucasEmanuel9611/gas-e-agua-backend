import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "eduardo@2304";
  const passwordHash = await hash(password, 8);

  const adminUser = await prisma.user.create({
    data: {
      email: "eduardogas2013@hotmail.com",
      role: "ADMIN",
      password: passwordHash,
      telephone: "81999999",
      username: "Eduardo Admin",
    },
  });

  await prisma.address.create({
    data: {
      street: "hilda",
      reference: "perto da ladeira",
      number: "24",
      local: "Jaqueira",
      isDefault: true,
      user_id: adminUser.id,
    },
  });

  console.log("Admin user and address created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
