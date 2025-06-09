import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/roles";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
      isInstructor,
      organization,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Duplicate Entry",
        details: "An account with this email already exists.",
      });
    }

    // Check if this is the first user in the system
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Check if this is the first user in this organization
    const orgUserCount = await User.countDocuments({ organization });
    const isFirstOrgUser = orgUserCount === 0;

    // If not the first user in the system and not the first user in the organization
    if (!isFirstUser && !isFirstOrgUser) {
      // Check if the request is from an admin
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          error: "Permission Denied",
          details: "Only administrators can register new users.",
        });
      }

      // Verify the admin is registering for their own organization
      if (req.user.organization !== organization) {
        return res.status(403).json({
          error: "Permission Denied",
          details: "You can only register users for your own organization.",
        });
      }

      // Check if trying to create an admin user
      if (role === UserRole.ADMIN) {
        // Check if organization already has an admin
        const adminCount = await User.countDocuments({
          organization,
          role: UserRole.ADMIN,
        });

        if (adminCount > 0) {
          return res.status(403).json({
            error: "Permission Denied",
            details: "This organization already has an administrator.",
          });
        }
      }
    }

    // Create new user
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      password,
      role:
        isFirstUser || isFirstOrgUser
          ? UserRole.ADMIN
          : role || UserRole.MEMBER,
      isInstructor: isInstructor || false,
      organization,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isInstructor: user.isInstructor,
        organization: user.organization,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isInstructor: user.isInstructor,
        organization: user.organization,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to create account. Please try again later.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({
        error: "Authentication Error",
        details: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Invalid password for email:", email);
      return res.status(401).json({
        error: "Authentication Error",
        details: "Invalid email or password.",
      });
    }

    // Generate token with role, instructor status, and organization
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isInstructor: user.isInstructor,
        organization: user.organization,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isInstructor: user.isInstructor,
        organization: user.organization,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to log in. Please try again later.",
    });
  }
};
