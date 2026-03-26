import { Request, Response } from "express";
import { TaskService } from "./task.service";

export const TaskController = {
    async create (req: Request, res: Response) {
        const { title, description, projectId, assignedTo } = req.body;

        const task = await TaskService.create({
            title,
            description,
            projectId,
            assignedTo,
        });

        return res.status(201).json(task);
    },

    async findAll (req: Request, res: Response) {
        const { projectId, status } = req.query as {
            projectId?: string,
            status?: string,
        }

        const tasks = await TaskService.findAll(projectId, status);

        return res.status(200).json(tasks);
    },

    async findById (req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const task = await TaskService.findById(id);

        return res.status(200).json(task);
    }, 

    async update (req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { title, description, assignedTo } = req.body;

        const task = await TaskService.update(id, {
            title,
            description,
            assignedTo,
        });

        return res.status(200).json(task);
    },

    async updateSatus (req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { status } = req.body;

        const task = await TaskService.updateStatus(id, {status});

        return res.status(200).json(task);
    },

    async delete (req: Request, res: Response) {
        const { id } = req.params as { id: string };

        await TaskService.delete(id);

        return res.status(204).send();
    },
};