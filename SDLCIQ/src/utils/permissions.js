export const getCurrentUser = () => {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
};

export const hasRole = (...allowedRoles) => {
    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    return allowedRoles.includes(user.role);
};