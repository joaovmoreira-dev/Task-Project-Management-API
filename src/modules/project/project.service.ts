import { AppError } from "../../errors/AppErrors";
import { ProjectRepository } from "../project/project.repository";
import { createProject, updateProject } from "./project.dto";
import { isAdmin } from "../../utils/roleHelpers";

function ensureProjectPermission(
    project: { ownerId: string } | null,
    userId: string,
    role:   string,
) {
    if (!project) {
        throw new AppError("Projeto não encontrado", 404);
    };

    const isOwner = project.ownerId === userId;

    if (!isOwner && !isAdmin(role)){
        throw new AppError("Você não tem permissão para acessar esse projeto", 403);
    } 
};

export const ProjectService = {
    async create( userId: string, data: createProject) {
        const name = data.name?.trim();
        const description = data.description?.trim();

        if(!name) {
            throw new AppError("Nome não pode ser vazio", 400);
        }

        if(name.length > 100) {
            throw new AppError("Nome deve ter no máximo 100 caracteres", 400);
        }
        
        if(data.description !== undefined) {
            if(description && description.length > 255) {
                throw new AppError ("Descrição deve ter no máximo 255 caracteres", 400);
            }
        }

        return ProjectRepository.create({ 
            name, 
            description: data.description?.trim() 
        }, 
        userId);
    },

    async findAllByUser(userId: string) {
        return ProjectRepository.findAllByUser(userId);
    },

    async findById(userId: string, role: string, projectId: string) {
        const project = await ProjectRepository.findById(projectId);

        ensureProjectPermission(project, userId, role);
        
        return project;
    },

    async update( userId: string, role: string, projectId: string, data: updateProject ) {
        const project = await ProjectRepository.findById(projectId);
        ensureProjectPermission( project, userId, role );

        const name = data.name?.trim();
        const description = data.description?.trim();

        if(data.name !== undefined) {
            if(!name) {
                throw new AppError("Nome não pode ser vazio", 400);
            }

            if(name.length > 100) {
                throw new AppError("Nome deve ter no máximo 100 caracteres", 400);
            }
        }
        if(data.description !== undefined) {
            if(description && description.length > 255) {
                throw new AppError ("Descrição deve ter no máximo 255 caracteres", 400);
            }
        }

        return ProjectRepository.update(projectId, {
            ...(data.name !== undefined && {name}),
            ...(data.description !== undefined && {description}),
        });
    },

    async delete( userId: string, role: string, projectId: string ) {    
        const project = await ProjectRepository.findById(projectId)

        ensureProjectPermission( project, userId, role )

        await ProjectRepository.delete(projectId);

        return true;
    },
};