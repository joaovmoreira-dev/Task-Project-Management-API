type Role = "ADMIN" | "MANAGER" | "MEMBER";

export function isAdmin(role: string): boolean {
    return role === "ADMIN";
};

export function isManager(role: string): boolean {
    return role === "MANAGER";
};

export function isMember(role: string): boolean {
    return role === "MEMBER";
};

export function hasRole(role: string, allowed: Role[]): boolean {
    return allowed.includes(role as Role);
};