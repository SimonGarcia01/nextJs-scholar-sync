export type JwtPayload = {
    permissions?: string[];
};

const decodeBase64Url = (value: string) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return atob(padded);
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
    const parts = token.split(".");
    if (parts.length < 2) {
        return null;
    }

    try {
        const json = decodeBase64Url(parts[1]);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
};

export const getPermissionsFromToken = (token: string | null) => {
    if (!token) {
        return [];
    }

    const payload = decodeJwtPayload(token);
    return Array.isArray(payload?.permissions) ? payload.permissions : [];
};
