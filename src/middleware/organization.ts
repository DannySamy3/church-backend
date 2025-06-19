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
    console.log("Organization middleware called");
    console.log("User from request:", req.user);

    // Get the user ID from the auth middleware
    const userId = req.user?._id;
    console.log("User ID:", userId);

    if (!userId) {
      console.log("No user ID found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the user's organization
    const user = await User.findById(userId);
    console.log("Found user in organization middleware:", user);

    if (!user) {
      console.log("User not found in organization middleware");
      return res.status(401).json({ error: "User not found" });
    }

    // Attach the organization to the request object
    req.organization = user.organization;
    console.log("Set organization:", req.organization);
    next();
  } catch (error) {
    console.error("Organization middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
