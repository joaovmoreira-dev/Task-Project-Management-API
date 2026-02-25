import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles: RoleName[] = ["ADMIN", "MANAGER", "MEMBER"];

  await prisma.role.createMany({
    data: roles.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const inserted = await prisma.role.findMany({ orderBy: { name: "asc" } });
  console.log("Roles no banco:", inserted.map((r) => r.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });