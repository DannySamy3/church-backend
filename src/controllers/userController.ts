import { Request, Response } from "express";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import { generateRandomPassword } from "../utils/passwordGenerator";
import { sendWelcomeEmail } from "../utils/emailService";
import { uploadImageToImgur } from "../utils/imgurUpload";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      organization: req.organization,
      role: { $ne: UserRole.REGULAR },
    }).select("-password");
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
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      role,
      address,
      member,
      gender,
    } = req.body;

    // Validate role is one of the allowed values
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        details: `Role must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Validate required fields based on role
    if (
      role === UserRole.REGULAR ||
      role === UserRole.CLERK ||
      role === UserRole.INSTRUCTOR
    ) {
      if (
        !firstName ||
        !lastName ||
        !phoneNumber ||
        member === undefined ||
        !gender
      ) {
        return res.status(400).json({
          error: "Missing required fields",
          details:
            "firstName, lastName, phoneNumber, member, and gender are required for regular, clerk, and instructor users",
        });
      }
      // Check if image is provided for regular, clerk, and instructor users
      if (!req.file) {
        return res.status(400).json({
          error: "Missing required field",
          details:
            "Profile image is required for the selected role (regular, clerk, or instructor)",
        });
      }
    } else {
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        member === undefined ||
        !gender
      ) {
        return res.status(400).json({
          error: "Missing required fields",
          details:
            "firstName, lastName, email, phoneNumber, member, and gender are required",
        });
      }
    }

    // Validate gender
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        error: "Invalid gender",
        details: "Gender must be either 'male' or 'female'",
      });
    }

    // Check if user already exists (only if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }
    }

    // Check if a user with the same phone number already exists
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res
        .status(400)
        .json({ error: "User with this phone number already exists" });
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

    // Generate a random password only for non-regular users
    const generatedPassword =
      role === UserRole.REGULAR
        ? undefined
        : generateRandomPassword(firstName, lastName);

    // Handle image upload
    let profileImageUrl;
    if (req.file) {
      profileImageUrl = await uploadImageToImgur(req.file);
      if (!profileImageUrl) {
        // For regular, clerk, and instructor users, fail if image upload fails
        if (
          role === UserRole.REGULAR ||
          role === UserRole.CLERK ||
          role === UserRole.INSTRUCTOR
        ) {
          return res.status(500).json({
            error: "Failed to upload profile image",
            details: "Please try again with a different image",
          });
        }
        console.warn("Failed to upload profile image to Imgur");
      }
    }

    // Create new user
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      password: generatedPassword,
      role: role || UserRole.CLERK,
      organization: req.organization,
      profileImageUrl,
      member,
      gender,
    });

    await user.save();

    // Send welcome email with credentials only for non-regular users
    if (email && role !== UserRole.REGULAR && generatedPassword) {
      const emailSent = await sendWelcomeEmail(
        email,
        firstName,
        generatedPassword
      );
      if (!emailSent) {
        console.warn(`Failed to send welcome email to ${email}`);
      }
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        address: user.address,
        profileImageUrl: user.profileImageUrl,
        member: user.member,
        gender: user.gender,
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

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        error: "Authentication required",
        details:
          "You must be logged in to access your profile. Please log in and try again.",
      });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "Profile not found",
        details:
          "Your user profile could not be found. This might be due to an invalid session or deleted account. Please try logging in again.",
      });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      error: "Profile retrieval failed",
      details:
        "An unexpected error occurred while fetching your profile. Please try again later or contact support if the problem persists.",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        error: "Authentication required",
        details:
          "You must be logged in to change your password. Please log in and try again.",
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "Profile not found",
        details:
          "Your user profile could not be found. This might be due to an invalid session or deleted account. Please try logging in again.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: "Password verification failed",
        details:
          "The current password you entered is incorrect. Please verify your current password and try again.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      error: "Password change failed",
      details:
        "An unexpected error occurred while changing your password. Please try again later or contact support if the problem persists.",
    });
  }
};

export const getRegularUsers = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findById(req.organization);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const users = await User.find({
      role: UserRole.REGULAR,
      organization: req.organization,
    }).select("-password");
    res.json({ users, organizationName: organization.name });
  } catch (error) {
    console.error("Error fetching regular users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = Object.values(UserRole);
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addScanUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      member,
      gender,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      member === undefined ||
      !gender
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        details:
          "firstName, lastName, phoneNumber, member, and gender are required.",
      });
    }

    // Validate gender
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        error: "Invalid gender",
        details: "Gender must be either 'male' or 'female'",
      });
    }

    // Check if user already exists (only if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }
    }

    // Check if a user with the same phone number already exists
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res
        .status(400)
        .json({ error: "User with this phone number already exists" });
    }

    // Handle image upload (optional)
    let profileImageUrl;
    if (req.file) {
      profileImageUrl = await uploadImageToImgur(req.file);
      if (!profileImageUrl) {
        // Log a warning but don't fail the request
        console.warn("Image file was provided but failed to upload to Imgur.");
      }
    }

    // --- Ensure admin is recorded in CommunionAttendance for today ---
    if (req.user?._id) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const adminAttendance = await CommunionAttendance.findOne({
        user: req.user._id,
        organization: req.organization,
        scannedAt: { $gte: startOfDay, $lte: endOfDay },
      });
      if (!adminAttendance) {
        const adminRecord = new CommunionAttendance({
          user: req.user._id,
          organization: req.organization,
          scannedBy: req.user._id,
          scannedAt: new Date(),
        });
        await adminRecord.save();
      }
    }
    // --- End admin attendance logic ---

    // Create new user with REGULAR role
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      role: UserRole.REGULAR, // Hardcoded to REGULAR
      organization: req.organization,
      profileImageUrl,
      member,
      gender,
    });

    await user.save();

    // Add user to communion attendance
    const attendanceRecord = new CommunionAttendance({
      user: user._id,
      organization: req.organization,
      scannedBy: req.user?._id, // The user performing the scan
      scannedAt: new Date(),
    });

    await attendanceRecord.save();

    res.status(201).json({
      message: "User created and attendance recorded successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        address: user.address,
        profileImageUrl: user.profileImageUrl,
        member: user.member,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Error creating scan user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
