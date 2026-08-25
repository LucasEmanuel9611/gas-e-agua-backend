import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "eduardo@2304";

type SeedAddress = Pick<
  Prisma.AddressCreateInput,
  "street" | "reference" | "number" | "local"
>;

type SeedUser = {
  email: string;
  username: string;
  telephone: string;
  role: UserRole;
  address: SeedAddress;
};

type SeedStockItem = {
  name: string;
  type: string;
  quantity: number;
  value: number;
};

type SeedAddonItem = {
  name: string;
  type: string;
  value: number;
};

const SEED_USERS: SeedUser[] = [
  {
    email: "eduardogas2013@hotmail.com",
    username: "Eduardo Admin",
    telephone: "81999999",
    role: "ADMIN",
    address: {
      street: "hilda",
      reference: "perto da ladeira",
      number: "24",
      local: "Jaqueira",
    },
  },
  {
    email: "cliente@teste.com",
    username: "Cliente Teste",
    telephone: "81988888",
    role: "USER",
    address: {
      street: "Rua do teste",
      reference: "Próximo ao mercado",
      number: "100",
      local: "Centro",
    },
  },
  {
    email: "entregador@teste.com",
    username: "Eduardo Entregador",
    telephone: "81977777",
    role: "DELIVERY_MAN",
    address: {
      street: "Rua das Entregas",
      reference: "Base de distribuição",
      number: "50",
      local: "Centro",
    },
  },
];

const SEED_STOCK_ITEMS: SeedStockItem[] = [
  { name: "Gás", type: "GAS", quantity: 30, value: 89.9 },
  { name: "Água", type: "WATER", quantity: 50, value: 12 },
];

const SEED_ADDON_ITEMS: SeedAddonItem[] = [
  { name: "Botijão para Água", type: "WATER_VESSEL", value: 15 },
  { name: "Botijão para Gás", type: "GAS_VESSEL", value: 25 },
];

async function upsertUser(seedUser: SeedUser, passwordHash: string) {
  return prisma.user.upsert({
    where: { email: seedUser.email },
    update: {},
    create: {
      email: seedUser.email,
      username: seedUser.username,
      telephone: seedUser.telephone,
      role: seedUser.role,
      password: passwordHash,
    },
  });
}

async function createAddressIfMissing(userId: number, address: SeedAddress) {
  const existingAddress = await prisma.address.findFirst({
    where: { user_id: userId },
  });

  if (existingAddress) {
    return;
  }

  await prisma.address.create({
    data: {
      ...address,
      isDefault: true,
      user_id: userId,
    },
  });
}

async function createStockIfMissing(stockItem: SeedStockItem) {
  const existingStockItem = await prisma.stock.findFirst({
    where: { type: stockItem.type },
  });

  if (existingStockItem) {
    return;
  }

  await prisma.stock.create({ data: stockItem });
}

async function createAddonIfMissing(addonItem: SeedAddonItem) {
  const existingAddonItem = await prisma.addons.findFirst({
    where: { type: addonItem.type },
  });

  if (existingAddonItem) {
    return;
  }

  await prisma.addons.create({ data: addonItem });
}

async function seedUserAccount(seedUser: SeedUser, passwordHash: string) {
  const user = await upsertUser(seedUser, passwordHash);
  await createAddressIfMissing(user.id, seedUser.address);
}

async function seedUsers(passwordHash: string) {
  await Promise.all(
    SEED_USERS.map((seedUser) => seedUserAccount(seedUser, passwordHash))
  );
}

async function seedStockItems() {
  await Promise.all(SEED_STOCK_ITEMS.map(createStockIfMissing));
}

async function seedAddonItems() {
  await Promise.all(SEED_ADDON_ITEMS.map(createAddonIfMissing));
}

async function main() {
  const passwordHash = await hash(DEFAULT_PASSWORD, 8);

  await seedUsers(passwordHash);
  await seedStockItems();
  await seedAddonItems();

  console.log("Seed completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error({ error });
    await prisma.$disconnect();
    process.exit(1);
  });
