import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      organization?: string;
    }
  }
}

export const organizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user ID from the auth middleware
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the user's organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach the organization to the request object
    req.organization = user.organization;
    next();
  } catch (error) {
    console.error("Organization middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
