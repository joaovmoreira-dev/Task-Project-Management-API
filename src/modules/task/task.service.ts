import { AppError } from "../../errors/AppErrors";
import { TaskRepository } from "./task.repository";
import { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO } from "./task.dto";
import { ProjectRepository } from "../project/project.repository";
import { UserRepository } from "../auth/user.repository";
import { isAdmin, isManager, isMember } from "../../utils/roleHelpers";
import { AuditService } from "../audit/audit.service";

const VALID_STATUSES = ["TODO", "DOING", "DONE"];

function ensureTaskPermission(
    task: { assignedTo: string | null; project: { ownerId: string } } | null,
    userId: string,
    role: string,
) {
    if (!task) {
        throw new AppError("Task não encontrada", 404);
    }

    const isAssigned = task.assignedTo === userId;
    const isProjectOwner = task.project.ownerId === userId;

    if (isAdmin(role)) return;
    if (isManager(role) && isProjectOwner) return;
    if (isAssigned) return;

    throw new AppError("Acesso negado", 403);
}

export const TaskService = {
    async create(userId: string, data: CreateTaskDTO) {
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

        const task = await TaskRepository.create({
            ...data,
            title: data.title.trim(),
            description: data.description?.trim(),
        });

        await AuditService.log({
            userId,
            action: "TASK_CREATED",
            entity: "Task",
            entityId: task.id,     
        })

        return task;
    },

    async findAll(userId: string, role: string, projectId?: string, status?: string) {
        if (status && !VALID_STATUSES.includes(status)) {
            throw new AppError("Status inválido", 400);
        }

        if (isMember(role)) {
            return TaskRepository.findAll(projectId, status, userId);
        }

        return TaskRepository.findAll(projectId, status);
    },

    async findById(userId: string, role: string, id: string) {
        const task = await TaskRepository.findByIdWithProject(id);

        if (!task) {
            throw new AppError("Task não encontrada", 404);
        }

        if (isMember(role) && task.assignedTo !== userId) {
            throw new AppError("Acesso negado", 403);
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

        const updated = await TaskRepository.update(id, {
            ...(data.title !== undefined && { title: data.title.trim() }),
            ...(data.description !== undefined && { description: data.description.trim() }),
            ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        });

        await AuditService.log({
            userId,
            action: "TASK_UPDATED",
            entity: "Task",
            entityId: id,
        })

        return updated;
    },

    async updateStatus(userId: string, role: string, id: string, data: UpdateTaskStatusDTO) {
        const task = await TaskRepository.findByIdWithProject(id);

        ensureTaskPermission(task, userId, role);

        if (!VALID_STATUSES.includes(data.status)) {
            throw new AppError("Status inválido", 400);
        }

        const updated = await TaskRepository.updateStatus(id, data);

        await AuditService.log({
            userId,
            action: "TASK_STATUS_CHANGED",
            entity: "Task",
            entityId: id,
        }) 

        return updated;
    },

    async delete(userId: string, role: string, id: string) {
        const task = await TaskRepository.findByIdWithProject(id);

        ensureTaskPermission(task, userId, role);

        await TaskRepository.delete(id);

        await AuditService.log({
            userId,
            action:"TASK_DELETED",
            entity: "Task",
            entityId: id,
        })

        return true;
    },
};