export enum UserRole {
  ADMIN = "admin",
  CLERK = "clerk",
  REGULAR = "regular",
  INSTRUCTOR = "instructor",
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageLessons: boolean;
  canManageClasses: boolean;
  canViewReports: boolean;
  canManageOrganization: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageLessons: true,
    canManageClasses: true,
    canViewReports: true,
    canManageOrganization: true,
  },
  [UserRole.CLERK]: {
    canManageUsers: false,
    canManageLessons: false,
    canManageClasses: false,
    canViewReports: false,
    canManageOrganization: false,
  },
  [UserRole.REGULAR]: {
    canManageUsers: false,
    canManageLessons: false,
    canManageClasses: false,
    canViewReports: false,
    canManageOrganization: false,
  },
  [UserRole.INSTRUCTOR]: {
    canManageUsers: false,
    canManageLessons: false,
    canManageClasses: false,
    canViewReports: false,
    canManageOrganization: false,
  },
};
