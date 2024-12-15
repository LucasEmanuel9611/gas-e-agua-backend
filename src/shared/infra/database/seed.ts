import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "eduardo@2304";
  const passwordHash = await hash(password, 8);

  await prisma.user.create({
    data: {
      email: "eduardogas2013@hotmail.com",
      isAdmin: true,
      password: passwordHash,
      telephone: "81999999",
      username: "Eduardo Admin",
    },
  });

  console.log("Admin user created");
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
