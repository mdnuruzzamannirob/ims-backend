export type Role = "admin" | "manager" | "staff";

export type Resource =
  | "user"
  | "category"
  | "supplier"
  | "product"
  | "inventory"
  | "purchase"
  | "sale"
  | "payment"
  | "report"
  | "dashboard"
  | "customer";

export type Action = "create" | "read" | "update" | "delete" | "manage";

type PermissionMap = Record<Role, Partial<Record<Resource, Action[]>>>;

const permissions: PermissionMap = {
  admin: {
    user: ["create", "read", "update", "delete", "manage"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    product: ["create", "read", "update", "delete"],
    inventory: ["create", "read", "update", "delete", "manage"],
    purchase: ["create", "read", "update", "delete", "manage"],
    sale: ["create", "read", "update", "delete", "manage"],
    payment: ["create", "read", "update", "delete", "manage"],
    report: ["read", "manage"],
    dashboard: ["read"],
    customer: ["create", "read", "update", "delete"],
  },
  manager: {
    user: ["read"],
    category: ["create", "read", "update"],
    supplier: ["create", "read", "update"],
    product: ["create", "read", "update"],
    inventory: ["read", "update", "manage"],
    purchase: ["create", "read", "update", "manage"],
    sale: ["create", "read", "update", "manage"],
    payment: ["create", "read", "update"],
    report: ["read"],
    dashboard: ["read"],
    customer: ["create", "read", "update"],
  },
  staff: {
    category: ["read"],
    supplier: ["read"],
    product: ["read"],
    inventory: ["read"],
    purchase: ["create", "read"],
    sale: ["create", "read"],
    payment: ["read"],
    dashboard: ["read"],
    customer: ["read", "create"],
  },
};

export const hasPermission = (
  role: Role,
  resource: Resource,
  action: Action,
): boolean => {
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;
  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;
  return resourceActions.includes(action);
};

export const getRolePermissions = (
  role: Role,
): Partial<Record<Resource, Action[]>> => {
  return permissions[role] || {};
};
