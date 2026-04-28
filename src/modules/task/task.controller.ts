import { Request, Response } from "express";
import { TaskService } from "./task.service";

export const TaskController = {
    async create(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const { title, description, projectId, assignedTo } = req.body;

        const task = await TaskService.create(userId, {
            title,
            description,
            projectId,
            assignedTo,
        });

        return res.status(201).json(task);
    },

    async findAll(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { projectId, status } = req.query as {
            projectId?: string;
            status?: string;
        };

        const tasks = await TaskService.findAll(userId, role, projectId, status);

        return res.status(200).json(tasks);
    },

    async findById(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as { id: string };

        const task = await TaskService.findById(userId, role, id);

        return res.status(200).json(task);
    },

    async update(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as { id: string };
        const { title, description, assignedTo } = req.body;

        const task = await TaskService.update(userId, role, id, {
            title,
            description,
            assignedTo,
        });

        return res.status(200).json(task);
    },

    async updateStatus(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as { id: string };
        const { status } = req.body;

        const task = await TaskService.updateStatus(userId, role, id, { status });

        return res.status(200).json(task);
    },

    async delete(req: Request, res: Response) {
        const userId = req.auth?.userId as string;
        const role = req.auth?.role as string;
        const { id } = req.params as { id: string };

        await TaskService.delete(userId, role, id);

        return res.status(204).send();
    },
};