import { ProjectRepository } from "./project.repository";
import { createProject, updateProject } from "./dto/project.dto";

export const ProjectService = {
    async create( userId: string, data: createProject) {
        return ProjectRepository.create(data, userId);
    },

    async findAllByUser(userId: string) {
        return ProjectRepository.findAllByUser(userId);
    },

    async findById(userId: string, id: string) {
        const project = await ProjectRepository.findById(id);

        if (!project || project.ownerId !== userId) {
            return null;
        };

        return project;
    },

    async update( userId: string, id: string, data: updateProject ) {
        const project = await ProjectRepository.findById(id)

        if (!project || project.ownerId !== userId) {
            return null;
        }

        return ProjectRepository.update(id, data);
    },

    async delete( userId: string, id: string ) {    
        const project = await ProjectRepository.findById(id)

        if (!project || project.ownerId !== userId) {
            return null;
        }

        return ProjectRepository.delete(id);
    },
};