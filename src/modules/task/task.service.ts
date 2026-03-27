import { AppError } from "../../errors/AppErrors";
import { TaskRepository } from "./task.repository";
import { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO } from "./task.dto";
import { ProjectRepository } from "../project/project.repository";
import { UserRepository } from "../auth/user.repository";

const VALID_STATUSES = ["TODO", "DOING", "DONE"];

function ensureTaskPermission(
    task: { assignedTo: string | null; project: { ownerId: string } } | null,
    userId: string,
    role: string,
) {
    if (!task) {
        throw new AppError("Task não encontrada", 404);
    }

    const isAdmin = role === "ADMIN";
    const isManager = role === "MANAGER";
    const isAssigned = task.assignedTo === userId;
    const isProjectOwner = task.project.ownerId === userId;

    if (isAdmin) return;
    if (isManager && isProjectOwner) return;
    if (isAssigned) return;

    throw new AppError("Você não tem permissão para executar essa ação", 403);
}

export const TaskService = {
    async create(data: CreateTaskDTO) {
        if (!data.title?.trim()) {
            throw new AppError("Título é obrigatório", 400);
        }

        if (data.title.trim().length > 100) {
            throw new AppError("Título deve ter no máximo 100 caracteres", 400);
        }

        const project = await ProjectRepository.findById(data.projectId);
        if (!project) {
            throw new AppError("Projeto não encontrado", 404);
        }

        if (data.assignedTo) {
            const user = await UserRepository.findById(data.assignedTo);
            if (!user) {
                throw new AppError("Usuário não encontrado", 404);
            }
        }

        return TaskRepository.create({
            ...data,
            title: data.title.trim(),
            description: data.description?.trim(),
        });
    },

    async findAll(userId: string, role: string, projectId?: string, status?: string) {
        if (status && !VALID_STATUSES.includes(status)) {
            throw new AppError("Status inválido", 400);
        }

        if (role === "MEMBER") {
            return TaskRepository.findAll(projectId, status, userId);
        }

        return TaskRepository.findAll(projectId, status);
    },

    async findById(userId: string, role: string, id: string) {
        const task = await TaskRepository.findByIdWithProject(id);

        if (!task) {
            throw new AppError("Task não encontrada", 404);
        }

        if (role === "MEMBER" && task.assignedTo !== userId) {
            throw new AppError("Você não tem permissão para acessar essa task", 403);
        }

        return task;
    },

    async update(userId: string, role: string, id: string, data: UpdateTaskDTO) {
        const task = await TaskRepository.findByIdWithProject(id);

        ensureTaskPermission(task, userId, role);

        if (data.title !== undefined) {
            if (!data.title.trim()) {
                throw new AppError("Título não pode ser vazio", 400);
            }
            if (data.title.trim().length > 100) {
                throw new AppError("Título deve ter no máximo 100 caracteres", 400);
            }
        }

        if (data.assignedTo !== undefined && data.assignedTo !== null) {
            const user = await UserRepository.findById(data.assignedTo);
            if (!user) {
                throw new AppError("Usuário não encontrado", 404);
            }
        }

        return TaskRepository.update(id, {
            ...(data.title !== undefined && { title: data.title.trim() }),
            ...(data.description !== undefined && { description: data.description.trim() }),
            ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        });
    },

    async updateStatus(userId: string, role: string, id: string, data: UpdateTaskStatusDTO) {
        const task = await TaskRepository.findByIdWithProject(id);

        ensureTaskPermission(task, userId, role);

        if (!VALID_STATUSES.includes(data.status)) {
            throw new AppError("Status inválido", 400);
        }

        return TaskRepository.updateStatus(id, data);
    },

    async delete(userId: string, role: string, id: string) {
        const task = await TaskRepository.findByIdWithProject(id);

        ensureTaskPermission(task, userId, role);

        await TaskRepository.delete(id);

        return true;
    },
};