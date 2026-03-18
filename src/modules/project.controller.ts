import { Request, Response } from "express";
import { ProjectService } from "./project.service";

export const ProjectController = {
    async create (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Nome é Obrigatório" });
        }

        const project = await ProjectService.create(userId, {
            name,
            description,
        });
        
        return res.status(201).json(project); 
    },

     async findAll (req: Request, res: Response){
        const userId = req.auth?.userId as string;

        const projects = await ProjectService.findAllByUser(userId)

        return res.json(projects);
    },

     async findById (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const { id } = req.params as {id: string};

        const project = await ProjectService.findById(userId, id);

        if (!project){
            return res.status(404).json({ message: "Projeto não encontrado" });
        }

        return res.json(project);
     },

     async update (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const { id } = req.params as {id: string};

        const project = await ProjectService.update(userId, id, req.body);

        if (!project) {
            return res.status(404).json({ message: "Projeto não encontrado" });
        }

        return res.json(project);
    },

     async delete (req: Request, res: Response){
        const userId = req.auth?.userId as string;
        const { id } = req.params as {id: string};

        const project = await ProjectService.delete(userId, id);

        if (!project) {
            return res.status(404).json({ message: "Projeto não encontrado" });
        }

        return res.status(202).send();
    },

};