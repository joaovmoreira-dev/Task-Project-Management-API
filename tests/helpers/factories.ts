import { getApi } from "./app";
import { prisma } from "./db";

export async function createUser(data?: {
    name?: string;
    email?: string;
    password?: string;
}) {
    const name = data?.name ?? "Usuário Teste";
    const email = data?.email ?? "usuario@teste.com";
    const password = data?.password ?? "senha123";

    await getApi().post("/auth/register").send({ name, email, password });

    const login = await getApi().post("/auth/login").send({ email, password });

    return {
        token: login.body.accessToken as string,
        user: login.body.user,
    };
}

export async function createAdminUser(email = "admin@teste.com") {
    const { token, user } = await createUser({
        email,
        name: "Admin Teste",
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { role: { connect: { name: "ADMIN" } } },
    });

    const login = await getApi().post("/auth/login").send({
        email,
        password: "senha123",
    });

    return {
        token: login.body.accessToken as string,
        user: login.body.user,
    };
}

export async function createManagerUser(email = "manager@teste.com") {
    const { token, user } = await createUser({
        email,
        name: "Manager Teste",
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { role: { connect: { name: "MANAGER" } } },
    });

    const login = await getApi().post("/auth/login").send({
        email,
        password: "senha123",
    });

    return {
        token: login.body.accessToken as string,
        user: login.body.user,
    };
}

export async function createProject(token: string, name = "Projeto Teste") {
    const res = await getApi()
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name });

    return res.body;
}

export async function createTask(
    token: string,
    data: {
        title: string;
        projectId: string;
        assignedTo?: string;
    }
) {
    const res = await getApi()
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(data);

    return res.body;
}