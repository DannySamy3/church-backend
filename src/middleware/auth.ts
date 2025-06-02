import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types";
import { User } from "../models/User";
import { Organization } from "../models/Organization";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};

export const adminCreationAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization } = req.body;

    if (!organization) {
      return res
        .status(400)
        .json({ error: "Organization information is required" });
    }

    // Check if organization exists
    const orgExists = await Organization.findById(organization);
    if (!orgExists) {
      return res.status(400).json({ error: "Organization does not exist" });
    }

    // Check if there are any existing admins in this organization
    const adminCount = await User.countDocuments({
      organization,
      role: "admin",
    });

    if (adminCount > 0) {
      return res.status(403).json({
        error: "This organization already has an admin user",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
