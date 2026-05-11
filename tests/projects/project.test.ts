import { getApi } from "../helpers/app";
import { cleanDatabase, prisma } from "../helpers/db";
import { createUser, createAdminUser } from "../helpers/factories";
import { RoleName } from "@prisma/client";

beforeAll(async () => {
    const roles: RoleName[] = ["ADMIN", "MANAGER", "MEMBER"];
    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
});

beforeEach(async () => {
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

// ─── CRIAR PROJETO ───────────────────────────────────────

describe("POST /projects", () => {
    it("deve criar projeto com sucesso", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Teste", description: "Descrição" });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("name", "Projeto Teste");
    });

    it("deve definir ownerId automaticamente", async () => {
        const { token, user } = await createUser();

        const res = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Teste" });

        expect(res.body.ownerId).toBe(user.id);
    });

    it("deve retornar 401 sem token", async () => {
        const res = await getApi()
            .post("/projects")
            .send({ name: "Projeto Teste" });

        expect(res.status).toBe(401);
    });

    it("deve retornar 400 para nome vazio", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "" });

        expect(res.status).toBe(400);
    });
});

// ─── LISTAR PROJETOS ─────────────────────────────────────

describe("GET /projects", () => {
    it("deve retornar apenas projetos do usuário autenticado", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token1}`)
            .send({ name: "Projeto do User 1" });

        await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token2}`)
            .send({ name: "Projeto do User 2" });

        const res = await getApi()
            .get("/projects")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe("Projeto do User 1");
    });

    it("deve retornar 401 sem token", async () => {
        const res = await getApi().get("/projects");

        expect(res.status).toBe(401);
    });
});

// ─── BUSCAR PROJETO POR ID ────────────────────────────────

describe("GET /projects/:id", () => {
    it("owner deve buscar seu próprio projeto", async () => {
        const { token } = await createUser();

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Teste" });

        const res = await getApi()
            .get(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", created.body.id);
    });

    it("outro usuário não pode buscar projeto alheio", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token1}`)
            .send({ name: "Projeto do User 1" });

        const res = await getApi()
            .get(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para projeto inexistente", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .get("/projects/id-que-nao-existe")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

// ─── ATUALIZAR PROJETO ────────────────────────────────────

describe("PATCH /projects/:id", () => {
    it("owner deve atualizar seu projeto", async () => {
        const { token } = await createUser();

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Teste" });

        const res = await getApi()
            .patch(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Atualizado" });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Projeto Atualizado");
    });

    it("ADMIN deve atualizar qualquer projeto", async () => {
        const { token: ownerToken } = await createUser({ email: "owner@teste.com" });
        const { token: adminToken } = await createAdminUser();

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "Projeto do Owner" });

        const res = await getApi()
            .patch(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Atualizado pelo Admin" });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Atualizado pelo Admin");
    });

    it("outro usuário não pode atualizar projeto alheio", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token1}`)
            .send({ name: "Projeto do User 1" });

        const res = await getApi()
            .patch(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({ name: "Tentativa de atualização" });

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para projeto inexistente", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .patch("/projects/id-que-nao-existe")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Atualizado" });

        expect(res.status).toBe(404);
    });
});

// ─── DELETAR PROJETO ─────────────────────────────────────

describe("DELETE /projects/:id", () => {
    it("owner deve deletar seu projeto", async () => {
        const { token } = await createUser();

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Projeto Teste" });

        const res = await getApi()
            .delete(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(204);
    });

    it("ADMIN deve deletar qualquer projeto", async () => {
        const { token: ownerToken } = await createUser({ email: "owner@teste.com" });
        const { token: adminToken } = await createAdminUser();

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "Projeto do Owner" });

        const res = await getApi()
            .delete(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
    });

    it("outro usuário não pode deletar projeto alheio", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        const created = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token1}`)
            .send({ name: "Projeto do User 1" });

        const res = await getApi()
            .delete(`/projects/${created.body.id}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para projeto inexistente", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .delete("/projects/id-que-nao-existe")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});