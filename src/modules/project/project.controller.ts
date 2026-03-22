import { Request, Response } from "express";
import { ProjectService } from "./project.service";

export const ProjectController = {
    async create (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const { name, description } = req.body;

        const project = await ProjectService.create(userId, {
            name,
            description,
        });
        
        return res.status(201).json(project); 
    },

     async findAll (req: Request, res: Response){
        const userId = req.auth?.userId as string;

        const projects = await ProjectService.findAllByUser(userId)

        return res.status(200).json(projects);
    },

     async findById (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as {id: string};

        const project = await ProjectService.findById(userId, role, id);

        return res.status(200).json(project);
     },

     async update (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as {id: string};
        const { name, description } = req.body;

        const project = await ProjectService.update(userId, role, id, {
            name,
            description,
        });

        return res.status(200).json(project);
    },

     async delete (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as {id: string};

        await ProjectService.delete(userId, role, id);

        return res.status(204).send();
    },

};