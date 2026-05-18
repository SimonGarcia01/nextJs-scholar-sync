export type PermissionAction = "create" | "read" | "update" | "delete";

export type PermissionsIndex = Record<string, Set<PermissionAction>>;

export type ParsedPermission = {
    action: PermissionAction;
    entity: string;
};

export const parsePermission = (
    permission: string
): ParsedPermission | null => {
    const match = permission
        .trim()
        .match(/^(Create|Read|Update|Delete)\s+(.+)$/i);
    if (!match) {
        return null;
    }

    const action = match[1].toLowerCase() as PermissionAction;
    const entity = match[2].trim().toLowerCase();

    return { action, entity };
};

export const buildPermissionsIndex = (
    permissions: string[]
): PermissionsIndex => {
    const index: PermissionsIndex = {};

    permissions.forEach((permission) => {
        const parsed = parsePermission(permission);
        if (!parsed) {
            return;
        }

        if (!index[parsed.entity]) {
            index[parsed.entity] = new Set<PermissionAction>();
        }

        index[parsed.entity].add(parsed.action);
    });

    return index;
};

export const hasPermissionForEntity = (
    index: PermissionsIndex,
    entity: string,
    action: PermissionAction
) => {
    return index[entity.toLowerCase()]?.has(action) ?? false;
};

export const hasAnyPermissionForEntity = (
    index: PermissionsIndex,
    entity: string
) => {
    return (index[entity.toLowerCase()]?.size ?? 0) > 0;
};
