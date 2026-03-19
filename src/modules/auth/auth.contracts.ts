export type LoginRequestDTO = {
    email: string;
    password: string;
};

export type LoginResponseDTO = {
    accessToken: String;
    user: {
        id: string;
        name: string;
        email: string;
        roleId: string;
        createdAt: Date;
        role: {
            id: string;
            name: "ADMIN" | "MANAGER" | "MEMBER";
            createdAt: Date;
        };
    };
};