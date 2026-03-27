import { prisma } from "../../database/prisma";
import { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO } from "./task.dto";

export const TaskRepository = {
    async create(data: CreateTaskDTO) {
        return prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                projectId: data.projectId,
                assignedTo: data.assignedTo,
            },
        });
    },

    async findAll(projectId?: string, status?: string, assignedTo?: string) {
        return prisma.task.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(status && { status: status as any }),
                ...(assignedTo && { assignedTo }),
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async findById(id: string) {
        return prisma.task.findUnique({
            where: { id },
        });
    },

    async findByIdWithProject(id: string) {
        return prisma.task.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });
    },

    async update(id: string, data: UpdateTaskDTO) {
        return prisma.task.update({
            where: { id },
            data,
        });
    },

    async updateStatus(id: string, data: UpdateTaskStatusDTO) {
        return prisma.task.update({
            where: { id },
            data: { status: data.status },
        });
    },

    async delete(id: string) {
        return prisma.task.delete({
            where: { id },
        });
    },
};