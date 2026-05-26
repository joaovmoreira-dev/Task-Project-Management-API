import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task & Project Management API",
            version: "1.0.0",
            description: "API backend para gerenciamento de projetos e tarefas com controle de acesso baseado em roles (RBAC).",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        roleId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Project: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Task: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        description: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["TODO", "DOING", "DONE"],
                        },
                        projectId: { type: "string", format: "uuid" },
                        assignedTo: { type: "string", format: "uuid", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                AuditLog: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        action: { type: "string" },
                        entity: { type: "string", nullable: true },
                        entityId: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        user: { $ref: "#/components/schemas/User", nullable: true },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/docs/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);