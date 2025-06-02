import { Request, Response } from "express";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import { generateRandomPassword } from "../utils/passwordGenerator";
import { sendWelcomeEmail } from "../utils/emailService";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ organization: req.organization }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Prevent changing role to admin
    if (role === UserRole.ADMIN) {
      return res.status(403).json({ error: "Cannot change role to admin" });
    }

    const user = await User.findOne({
      _id: userId,
      organization: req.organization,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      _id: userId,
      organization: req.organization,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, middleName, lastName, email, phoneNumber, role } =
      req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({
        error:
          "Missing required fields: firstName, lastName, email, and phoneNumber are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Check if this is the first user in the system
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // If not the first user, verify admin permissions
    if (!isFirstUser) {
      // Check if the request is from an admin
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res
          .status(403)
          .json({ error: "Only admins can create new users" });
      }

      // Verify the admin is creating for their own organization
      if (req.user.organization !== req.organization) {
        return res
          .status(403)
          .json({ error: "Cannot create users for other organizations" });
      }
    }

    // Generate a random password
    const generatedPassword = generateRandomPassword(firstName, lastName);

    // Create new user
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      password: generatedPassword,
      role: role || UserRole.MEMBER,
      organization: req.organization,
    });

    await user.save();

    // Send welcome email with credentials
    const emailSent = await sendWelcomeEmail(
      email,
      firstName,
      generatedPassword
    );
    if (!emailSent) {
      console.warn(`Failed to send welcome email to ${email}`);
    }

    // Return user data without password
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
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      _id: userId,
      organization: req.organization,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
