export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  MEMBER = "member",
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageLessons: boolean;
  canManageCustomers: boolean;
  canManageClasses: boolean;
  canViewReports: boolean;
  canManageOrganization: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageLessons: true,
    canManageCustomers: true,
    canManageClasses: true,
    canViewReports: true,
    canManageOrganization: true,
  },
  [UserRole.INSTRUCTOR]: {
    canManageUsers: false,
    canManageLessons: true,
    canManageCustomers: false,
    canManageClasses: true,
    canViewReports: true,
    canManageOrganization: false,
  },
  [UserRole.MEMBER]: {
    canManageUsers: false,
    canManageLessons: false,
    canManageCustomers: false,
    canManageClasses: false,
    canViewReports: false,
    canManageOrganization: false,
  },
};
