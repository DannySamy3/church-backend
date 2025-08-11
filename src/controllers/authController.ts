import { Request, Response } from "express";
import { User } from "../models/User";
import { Class } from "../models/Class";
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
      organization,
      gender,
      member,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !organization ||
      !gender
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        details:
          "firstName, lastName, email, phoneNumber, password, organization, and gender are required",
      });
    }

    // Check if email is already associated with any user (in any organization)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Duplicate Entry",
        details: "An account with this email already exists.",
      });
    }

    // Check if this is the first user in this organization
    const orgUserCount = await User.countDocuments({ organization });
    if (orgUserCount > 0) {
      return res.status(403).json({
        error: "Permission Denied",
        details: "This organization already has an administrator.",
      });
    }

    // Create new admin user for the organization
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      password,
      role: UserRole.ADMIN,
      organization,
      gender,
      member,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organization: user.organization,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        organization: user.organization,
        gender: user.gender,
        member: user.member,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Server Error",
      details: error instanceof Error ? error.message : String(error),
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

    // Generate token with role and organization
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organization: user.organization,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", user._id);

    // Prepare user response object
    const userResponse: any = {
      id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      organization: user.organization,
      gender: user.gender,
      member: user.member,
    };

    // If user is an instructor, get their associated class information
    if (user.role === UserRole.INSTRUCTOR) {
      const instructorClass = await Class.findOne({
        instructor: user._id,
        organization: user.organization,
      });

      if (instructorClass) {
        userResponse.class = {
          id: instructorClass._id,
          name: instructorClass.name,
        };
      }
    }

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
