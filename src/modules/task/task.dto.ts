export type CreateTaskDTO = {
    title: string;
    description?: string;
    projectId: string;
    assignedTo?: string;
};

export type UpdateTaskDTO = {
    title?: string;
    description?: string;
    assignedTo?: string;
};

export type UpdateTaskStatusDTO = {
    status: "TODO" | "DOING" | "DONE";
};