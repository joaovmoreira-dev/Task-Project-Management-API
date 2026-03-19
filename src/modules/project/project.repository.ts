import { prisma } from "../../database/prisma";
import { createProject, updateProject } from "./project.dto";

export const ProjectRepository = {
    async create( data:  createProject, ownerId: string) {
        return prisma.project.create ({ 
            data: {
                ...data,
                ownerId,
            }
         });
    },

    async findAllByUser( userId: string ) {
        return prisma.project.findMany ({
            where: {
                ownerId: userId,
            }
        });
    },

    async findById ( id: string ) {
        return prisma.project.findUnique({
            where: { id },
        });
    },

    async update( id: string, data: updateProject ) {    
        return prisma.project.update({
            where: { id },
            data,
        });
    },

    async delete( id: string ) {
        return prisma.project.delete({
            where: { id },
        });
    },
};