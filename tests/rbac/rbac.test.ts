import { getApi } from "../helpers/app";
import { cleanDatabase, prisma } from "../helpers/db";
import { createUser, createAdminUser, createManagerUser, createProject, createTask } from "../helpers/factories";
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

// ─── ROTAS SEM TOKEN ─────────────────────────────────────

describe("Rotas protegidas sem token", () => {
    it("POST /projects → 401", async () => {
        const res = await getApi().post("/projects").send({ name: "Teste" });
        expect(res.status).toBe(401);
    });

    it("GET /projects → 401", async () => {
        const res = await getApi().get("/projects");
        expect(res.status).toBe(401);
    });

    it("POST /tasks → 401", async () => {
        const res = await getApi().post("/tasks").send({ title: "Teste" });
        expect(res.status).toBe(401);
    });

    it("GET /tasks → 401", async () => {
        const res = await getApi().get("/tasks");
        expect(res.status).toBe(401);
    });

    it("GET /audit-logs → 401", async () => {
        const res = await getApi().get("/audit-logs");
        expect(res.status).toBe(401);
    });
});

// ─── REQUIREROLE ─────────────────────────────────────────

describe("requireRole", () => {
    it("MEMBER não pode criar task → 403", async () => {
        const member = await createUser({ email: "member@teste.com" });
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${member.token}`)
            .send({ title: "Task", projectId: project.id });

        expect(res.status).toBe(403);
    });

    it("MEMBER não pode atualizar task → 403", async () => {
        const member = await createUser({ email: "member@teste.com" });
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ title: "Atualizado" });

        expect(res.status).toBe(403);
    });

    it("MEMBER não pode deletar task → 403", async () => {
        const member = await createUser({ email: "member@teste.com" });
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task",
            projectId: project.id,
        });

        const res = await getApi()
            .delete(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(res.status).toBe(403);
    });

    it("MEMBER não pode acessar audit-logs → 403", async () => {
        const member = await createUser({ email: "member@teste.com" });

        const res = await getApi()
            .get("/audit-logs")
            .set("Authorization", `Bearer ${member.token}`);

        expect(res.status).toBe(403);
    });

    it("MANAGER não pode acessar audit-logs → 403", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .get("/audit-logs")
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(403);
    });

    it("ADMIN pode acessar audit-logs → 200", async () => {
        const admin = await createAdminUser();

        const res = await getApi()
            .get("/audit-logs")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
    });
});

// ─── OWNERSHIP ───────────────────────────────────────────

describe("Ownership", () => {
    it("usuário não pode atualizar projeto alheio → 403", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        const project = await createProject(token1);

        const res = await getApi()
            .patch(`/projects/${project.id}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({ name: "Tentativa" });

        expect(res.status).toBe(403);
    });

    it("usuário não pode deletar projeto alheio → 403", async () => {
        const { token: token1 } = await createUser({ email: "user1@teste.com" });
        const { token: token2 } = await createUser({ email: "user2@teste.com" });

        const project = await createProject(token1);

        const res = await getApi()
            .delete(`/projects/${project.id}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.status).toBe(403);
    });

    it("MEMBER não pode alterar status de task alheia → 403", async () => {
        const member = await createUser({ email: "member@teste.com" });
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}/status`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ status: "DOING" });

        expect(res.status).toBe(403);
    });
});

// ─── EDGE CASES — PAYLOAD INVÁLIDO ───────────────────────

describe("Edge cases — payload inválido", () => {
    it("POST /auth/register sem body → 400", async () => {
        const res = await getApi().post("/auth/register").send({});
        expect(res.status).toBe(400);
    });

    it("POST /auth/login sem body → 400", async () => {
        const res = await getApi().post("/auth/login").send({});
        expect(res.status).toBe(400);
    });

    it("POST /projects sem nome → 400", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
    });

    it("POST /tasks sem título → 400", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ projectId: project.id });

        expect(res.status).toBe(400);
    });

    it("PATCH /tasks/:id/status com status inválido → 400", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}/status`)
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ status: "INVALIDO" });

        expect(res.status).toBe(400);
    });
});

// ─── EDGE CASES — IDS INVÁLIDOS ──────────────────────────

describe("Edge cases — IDs inválidos", () => {
    it("GET /projects/:id inexistente → 404", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .get("/projects/id-invalido")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it("GET /tasks/:id inexistente → 404", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .get("/tasks/id-invalido")
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(404);
    });

    it("PATCH /projects/:id inexistente → 404", async () => {
        const { token } = await createUser();

        const res = await getApi()
            .patch("/projects/id-invalido")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Teste" });

        expect(res.status).toBe(404);
    });

    it("DELETE /tasks/:id inexistente → 404", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .delete("/tasks/id-invalido")
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(404);
    });

    it("POST /tasks com projectId inexistente → 404", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "Task", projectId: "id-invalido" });

        expect(res.status).toBe(404);
    });
});