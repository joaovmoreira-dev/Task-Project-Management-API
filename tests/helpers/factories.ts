import { getApi } from "./app";
import { prisma } from "./db";

export async function createUser(data? : {
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
};

export async function createAdminUser() {
    const { token, user } = await createUser({
        email: "admin@teste.com",
        name: "Admin Teste"
    });

    await prisma.user.update({
        where: { id: user.id },
        data: {
            role: {
                connect: {
                    name: "ADMIN"
                },
            },
        },
    });

    const login = await getApi().post("/auth/login").send({
        email: "admin@teste.com",
        password: "senha123",
    });

    return {
        token: login.body.accessToken as string,
        user: login.body.user,
    };
};