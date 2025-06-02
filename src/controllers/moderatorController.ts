import { Request, Response } from "express";
import { User } from "../models/User";
import { UserReport } from "../models/UserReport";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in to view users.",
      });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch users. Please try again later.",
    });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in to view user details.",
      });
    }

    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        details: "User not found.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch user details. Please try again later.",
    });
  }
};

export const reportUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in to report users.",
      });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        error: "Missing Information",
        details: "Please provide a reason for reporting this user.",
      });
    }

    const reportedUser = await User.findById(req.params.userId);
    if (!reportedUser) {
      return res.status(404).json({
        error: "Not Found",
        details: "User not found.",
      });
    }

    const report = new UserReport({
      reportedBy: req.user._id,
      reportedUser: req.params.userId,
      reason,
    });

    await report.save();

    res.status(201).json({
      message: "User reported successfully",
      report,
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to report user. Please try again later.",
    });
  }
};
