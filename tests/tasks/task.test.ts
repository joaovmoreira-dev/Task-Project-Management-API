import { getApi } from "../helpers/app";
import { cleanDatabase, prisma } from "../helpers/db";
import {
    createUser,
    createAdminUser,
    createManagerUser,
    createProject,
    createTask,
} from "../helpers/factories";
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

// ─── CRIAR TASK ───────────────────────────────────────────

describe("POST /tasks", () => {
    it("MANAGER deve criar task em seu projeto", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "Task Teste", projectId: project.id });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Task Teste");
    });

    it("ADMIN deve criar task em qualquer projeto", async () => {
        const manager = await createManagerUser();
        const admin = await createAdminUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ title: "Task do Admin", projectId: project.id });

        expect(res.status).toBe(201);
    });

    it("MEMBER não pode criar task", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${member.token}`)
            .send({ title: "Task do Member", projectId: project.id });

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para projectId inexistente", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "Task Teste", projectId: "id-invalido" });

        expect(res.status).toBe(404);
    });

    it("deve retornar 404 para assignedTo inexistente", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({
                title: "Task Teste",
                projectId: project.id,
                assignedTo: "id-invalido",
            });

        expect(res.status).toBe(404);
    });

    it("deve retornar 400 para título vazio", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        const res = await getApi()
            .post("/tasks")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "", projectId: project.id });

        expect(res.status).toBe(400);
    });
});

// ─── LISTAR TASKS ────────────────────────────────────────

describe("GET /tasks", () => {
    it("MANAGER deve listar todas as tasks do projeto", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        await createTask(manager.token, {
            title: "Task 1",
            projectId: project.id,
        });
        await createTask(manager.token, {
            title: "Task 2",
            projectId: project.id,
        });

        const res = await getApi()
            .get(`/tasks?projectId=${project.id}`)
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it("MEMBER deve ver apenas tasks atribuídas a ele", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);

        await createTask(manager.token, {
            title: "Task do Member",
            projectId: project.id,
            assignedTo: member.user.id,
        });

        await createTask(manager.token, {
            title: "Task de outro",
            projectId: project.id,
        });

        const res = await getApi()
            .get("/tasks")
            .set("Authorization", `Bearer ${member.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe("Task do Member");
    });

    it("deve filtrar por status", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);

        await createTask(manager.token, {
            title: "Task TODO",
            projectId: project.id,
        });

        const res = await getApi()
            .get(`/tasks?status=TODO`)
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].status).toBe("TODO");
    });

    it("deve retornar 400 para status inválido", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .get("/tasks?status=INVALIDO")
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(400);
    });
});

// ─── ATUALIZAR TASK ───────────────────────────────────────

describe("PATCH /tasks/:id", () => {
    it("MANAGER deve atualizar task do seu projeto", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "Task Atualizada" });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Task Atualizada");
    });

    it("ADMIN deve atualizar qualquer task", async () => {
        const manager = await createManagerUser();
        const admin = await createAdminUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ title: "Atualizada pelo Admin" });

        expect(res.status).toBe(200);
    });

    it("MEMBER não pode atualizar task", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ title: "Tentativa" });

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para task inexistente", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .patch("/tasks/id-invalido")
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ title: "Atualizada" });

        expect(res.status).toBe(404);
    });
});

// ─── ATUALIZAR STATUS ────────────────────────────────────

describe("PATCH /tasks/:id/status", () => {
    it("MEMBER deve atualizar status de task atribuída a ele", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task do Member",
            projectId: project.id,
            assignedTo: member.user.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}/status`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ status: "DOING" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("DOING");
    });

    it("MEMBER não pode atualizar status de task não atribuída a ele", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task de outro",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}/status`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ status: "DOING" });

        expect(res.status).toBe(403);
    });

    it("deve retornar 400 para status inválido", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .patch(`/tasks/${task.id}/status`)
            .set("Authorization", `Bearer ${manager.token}`)
            .send({ status: "INVALIDO" });

        expect(res.status).toBe(400);
    });
});

// ─── DELETAR TASK ────────────────────────────────────────

describe("DELETE /tasks/:id", () => {
    it("MANAGER deve deletar task do seu projeto", async () => {
        const manager = await createManagerUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .delete(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(204);
    });

    it("ADMIN deve deletar qualquer task", async () => {
        const manager = await createManagerUser();
        const admin = await createAdminUser();
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .delete(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(204);
    });

    it("MEMBER não pode deletar task", async () => {
        const manager = await createManagerUser();
        const member = await createUser({ email: "member@teste.com" });
        const project = await createProject(manager.token);
        const task = await createTask(manager.token, {
            title: "Task Teste",
            projectId: project.id,
        });

        const res = await getApi()
            .delete(`/tasks/${task.id}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(res.status).toBe(403);
    });

    it("deve retornar 404 para task inexistente", async () => {
        const manager = await createManagerUser();

        const res = await getApi()
            .delete("/tasks/id-invalido")
            .set("Authorization", `Bearer ${manager.token}`);

        expect(res.status).toBe(404);
    });
});