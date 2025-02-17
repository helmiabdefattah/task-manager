const roles: Record<string, string[]> = {
    admin: ["deleteTask"],
    user: [],
};

export const hasPermission = (role: string, action: string): boolean => {
    const permissions = roles[role] || []; // Ensure it defaults to an empty array
    return permissions.includes(action);
};
