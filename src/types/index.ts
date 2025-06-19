import { UserRole, RolePermissions, rolePermissions } from "./roles";
import { IUser } from "../models/User";

export { UserRole, RolePermissions, rolePermissions };

export type { IUser };

export interface JwtPayload {
  id: string;
  role: UserRole;
  organization: string;
  isInstructor?: boolean;
}
