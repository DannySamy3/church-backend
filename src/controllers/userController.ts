import { Request, Response } from "express";
import { User } from "../models/User";

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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        error: "Authentication required",
        details:
          "You must be logged in to update your profile. Please log in and try again.",
      });
    }

    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "Profile not found",
        details:
          "Your user profile could not be found. This might be due to an invalid session or deleted account. Please try logging in again.",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      error: "Profile update failed",
      details:
        "An unexpected error occurred while updating your profile. Please try again later or contact support if the problem persists.",
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
