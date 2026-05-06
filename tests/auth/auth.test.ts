import { getApi } from "../helpers/app";
import { cleanDatabase, prisma } from "../helpers/db";
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

//--- REGISTER -------------------------------------------------------

describe("POST /auth/register", () => {
    it("deve registrar um usuário com sucesso", async () => {
        const res = await getApi()
            .post("/auth/register")
            .send({
                name: "João Teste",
                email: "joao@teste.com",
                password: "senha123",
            });
        
            expect(res.status).toBe(201);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user).toHaveProperty("email", "joao@teste.com");
            expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("deve retornar 409 para email já cadastrado", async () => {
        await getApi().post("/auth/register").send({
            name: "João Teste",
            email: "joao@teste.com",
            password: "senha123",
        });

        const res = await getApi().post("/auth/register").send({
            name: "João Teste",
            email: "joao@teste.com",
            password: "senha123",
        });

        expect(res.status).toBe(409);
    });

    it("deve retornar 400 para email inválido", async () => {
        const res = await getApi().post("/auth/register").send({
            name: "João Teste",
            email: "email-invalido",
            password: "senha123",
        });

        expect(res.status).toBe(400);
    });

    it("deve retornar 400 para senha curta", async () => {
        const res = await getApi().post ("/auth/register").send({
            name: "João Teste",
            email: "email-invalido",
            password: "123",
        });

        expect(res.status).toBe(400);
    });

    it("deve retornar 400 para campos ausentes", async () => {
        const res = await getApi().post("/auth/register").send({});

        expect(res.status).toBe(400);
    });
});

//--- LOGIN -------------------------------------------------------

describe("POST /auth/login", () => {
    beforeEach(async () => {
        await getApi().post("/auth/register").send({
            name: "João Teste",
            email: "joao@teste.com",
            password: "senha123",
        });
    });

    it("deve fazer login com sucesso e retornar token", async () => {
        const res = await getApi().post("/auth/login").send({
            email: "joao@teste.com",
            password: "senha123",
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("user");
        expect(res.body).not.toHaveProperty("passwordHash");
    });

    it("deve retornar 401 para senha incorreta", async () => {
        const res = await getApi().post("/auth/login").send({
            email: "joao@teste.com",
            password: "senhaerrada",
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Credenciais inválidas");
    });

    it("deve retornar 401 para email inexistente", async () => {
        const res = await getApi().post("/auth/login").send({
            email: "naoexiste@teste.com",
            password: "senha123",
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Credenciais inválidas");
    });

    it("deve retornar mesma mensagem para email e senha inválidos", async () => {
        const resEmail = await getApi().post("/auth/login").send({
            email: "naoexiste@teste.com",
            password: "senha123",
        });

        const resSenha = await getApi().post("/auth/login").send({
            email: "joao@teste.com",
            password: "senhaerrada",
        });

        expect(resEmail.body.message).toBe(resSenha.body.message);
    });
});

//--- MIDDLEWARE AUTH -------------------------------------------------------

describe("GET /auth/me", () => {
    it("deve retornar 401 sem token", async () => {
        const res = await getApi().get("/auth/me");

        expect(res.status).toBe(401);
    });

    it("deve retornar 403 com token inválido", async () => {
        const res = await getApi()
            .get("/auth/me")
            .set("Authorization", "Bearer token-invalido");
        
        expect(res.status).toBe(403);
    });

    it("deve retornar 200 com token válido", async () => {
        await getApi().post("/auth/register").send({
            name: "João Teste",
            email: "joao@teste.com",
            password: "senha123",
        });

        const login = await getApi().post("/auth/login").send({
            email: "joao@teste.com",
            password: "senha123",
        });

        const token =  login.body.accessToken;

        const res = await getApi()
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", "joao@teste.com");
    });
});