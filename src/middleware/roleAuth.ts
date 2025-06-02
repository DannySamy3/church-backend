import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole, rolePermissions, JwtPayload, IUser } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: Partial<IUser>;
    }
  }
}

export const checkPermission = (
  requiredPermission: keyof (typeof rolePermissions)[UserRole]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    const userRole = req.user.role as UserRole;
    const permissions = rolePermissions[userRole];

    if (!permissions[requiredPermission]) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
        required: requiredPermission,
        currentRole: userRole,
      });
    }

    next();
  };
};

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access denied. Insufficient role level.",
        allowedRoles,
        currentRole: userRole,
      });
    }

    next();
  };
};

export const checkInstructor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded.isInstructor) {
      return res
        .status(403)
        .json({ error: "Access denied. Instructor privileges required." });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      organization: "",
      comparePassword: async () => false,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
