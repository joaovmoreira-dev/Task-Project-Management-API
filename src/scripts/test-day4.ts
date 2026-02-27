import { prisma } from "../database/prisma";
import { RoleRepository } from "../repositories/role.repository";
import { UserRepository } from "../repositories/user.repository";

async function main() {
  console.log("🔎 Buscando role ADMIN...");
  const role = await RoleRepository.findByName("ADMIN");

  if (!role) {
    throw new Error("Role ADMIN não encontrada. Rode o seed.");
  }

  console.log("✅ Role encontrada:", role.name);

  const email = `test_${Date.now()}@mail.com`;

  console.log("👤 Criando usuário...");
  const userCreated = await UserRepository.create({
    name: "Usuário Teste",
    email,
    passwordHash: "hash_fake",
    roleId: role.id,
  });

  console.log("✅ Usuário criado (safe):", userCreated);

  console.log("🔎 Buscando por email (safe)...");
  const userSafe = await UserRepository.findByEmail(email);

  console.log("Resultado:", userSafe);

  if ((userSafe as any)?.passwordHash) {
    throw new Error("❌ passwordHash vazou na consulta safe!");
  }

  console.log("🔎 Buscando por email (com password)...");
  const userWithPassword =
    await UserRepository.findByEmailWithPassword(email);

  console.log(
    "Tem passwordHash?",
    !!userWithPassword?.passwordHash
  );

  if (!userWithPassword?.passwordHash) {
    throw new Error("❌ passwordHash não retornou na consulta interna!");
  }

  console.log("🎉 TESTE DO DIA 4 PASSOU COM SUCESSO!");
}

main()
  .catch((err) => {
    console.error("🚨 ERRO:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });