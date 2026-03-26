import { AppError } from "../../errors/AppErrors";
import { TaskRepository } from "./task.repository";
import { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO } from "./task.dto";
import { ProjectRepository } from "../project/project.repository";
import { UserRepository } from "../auth/user.repository";

const VALID_STATUSES = [ "TODO", "DOING", "DONE" ];

export const TaskService = {
    async create(data: CreateTaskDTO) {
        if(!data.title?.trim()) {
            throw new AppError("Título é obrigatório",400);
        };

        if(data.title.trim().length > 100) {
            throw new AppError("Título deve ter no máximo 100 caracteres",400);
        };

        const project = await ProjectRepository.findById(data.projectId);
        if(!project) {
            throw new AppError("Projeto não encontrado", 404);
        };

        if(data.assignedTo) {
            const user = await UserRepository.findById(data.assignedTo);
            if(!user) {
                throw new AppError("Usuário não encontrado", 404)
            };
        };

        return TaskRepository.create ({
            ...data,
            title: data.title.trim(),
            description: data.description?.trim(),
        });
    },

    async findAll(projectId?: string, status?: string ) {
        if(status && !VALID_STATUSES.includes(status)) {
            throw new AppError("Status Inválido",400);
        };

        return TaskRepository.findAll(projectId, status);
    },

    async findById(id: string) {
        const task = await TaskRepository.findById(id);

        if(!task) {
            throw new AppError("Task não encontrada",404);
        };

        return task;
    },

    async update(id: string, data: UpdateTaskDTO) {    
        const task = await TaskRepository.findById(id);

        if (!task) {
            throw new AppError("Task não encontrada", 404);
        };

        if (data.title !== undefined) {
            if (!data.title.trim()) {
                throw new AppError("Título não pode ser vazio",400);
            };
            if (data.title.trim().length > 100) {
                throw new AppError("Título deve ter no maxímo 100 caracteres");
            };
        };

        if (data.assignedTo !== undefined && data.assignedTo !== null) {
            const user = await UserRepository.findById(data.assignedTo);
            if(!user) {
                throw new AppError("Usuário não encontrado", 404);
            };
        };

        return TaskRepository.update(id, {
                ...(data.title !== undefined && { title: data.title.trim() }),
                ...(data.description !== undefined && { description: data.description.trim() }),
                ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo })
            });

    },

    async updateStatus(id: string, data: UpdateTaskStatusDTO) {
        const task = await TaskRepository.findById;

        if(!task) {
            throw new AppError("Task não encontrada", 404);
        };

        if(!VALID_STATUSES.includes(data.status)) {
            throw new AppError("Status Inválido", 400);
        };

        return TaskRepository.updateStatus(id, data);
    },

    async delete(id: string) {
        const task = await TaskRepository.findById(id);

        if(!task) {
            throw new AppError("Task não encontrada", 404);
        };

        await TaskRepository.delete(id);

        return true;
    },
};