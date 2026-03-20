import { describe } from "node:test";
import { ProjectRepository } from "../project/project.repository";
import { createProject, updateProject } from "./project.dto";

export const ProjectService = {
    async create( userId: string, data: createProject) {
        const name = data.name?.trim();

        if(!name){
            return null;
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

    async findById(userId: string, projectId: string) {
        const project = await ProjectRepository.findById(projectId);

        if (!project || project.ownerId !== userId) {
            return null;
        };

        return project;
    },

    async update( userId: string, projectId: string, data: updateProject ) {
        const project = await ProjectRepository.findById(projectId);

        if (!project || project.ownerId !== userId) {
            return null;
        }

        if (data.name !== undefined && !data.name.trim()){
            return null
        }

        return ProjectRepository.update(projectId, {
            name: data.name?.trim(),
            description: data.description?.trim(),
        });
    },

    async delete( userId: string, projectId: string ) {    
        const project = await ProjectRepository.findById(projectId)

        if (!project || project.ownerId !== userId) {
            return null;
        }

        await ProjectRepository.delete(projectId);

        return true;
    },
};