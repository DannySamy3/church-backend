import { Request, Response } from "express";
import { CommunionAttendance } from "../models/CommunionAttendance";
import { User } from "../models/User";
import mongoose from "mongoose";

const userFieldsToSelect =
  "firstName middleName lastName email phoneNumber role organization profileImageUrl address member";

// Get all attendance records for the latest date (for this organization)
export const getLatestAttendanceRecords = async (
  req: Request,
  res: Response
) => {
  try {
    // Find the latest scannedAt date for this organization
    const latestRecord = await CommunionAttendance.findOne({
      organization: req.organization,
    }).sort({ scannedAt: -1 });
    if (!latestRecord) return res.json([]);
    const latestDate = latestRecord.scannedAt;
    // Get all records for that date (same day) and organization
    const startOfDay = new Date(latestDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(latestDate);
    endOfDay.setHours(23, 59, 59, 999);
    const records = await CommunionAttendance.find({
      organization: req.organization,
      scannedAt: { $gte: startOfDay, $lte: endOfDay },
    })
      // .populate("organization")
      .populate({ path: "user", select: userFieldsToSelect })
      .populate({ path: "scannedBy", select: userFieldsToSelect });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get attendance by date range (for this organization)
export const getAttendanceByDateRange = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    const records = await CommunionAttendance.find({
      organization: req.organization,
      scannedAt: { $gte: startDate, $lte: endDate },
    })
      // .populate("organization")
      .populate({ path: "user", select: userFieldsToSelect })
      .populate({ path: "scannedBy", select: userFieldsToSelect });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get latest attendance stats (rate, last scan date, total participants) for this organization
export const getLatestAttendanceStats = async (req: Request, res: Response) => {
  try {
    // Find the latest scannedAt date for this organization
    const latestRecord = await CommunionAttendance.findOne({
      organization: req.organization,
    }).sort({ scannedAt: -1 });
    if (!latestRecord) {
      return res.json({
        attendanceRate: 0,
        lastScanDate: null,
        totalParticipants: 0,
      });
    }
    const latestDate = latestRecord.scannedAt;
    const startOfDay = new Date(latestDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(latestDate);
    endOfDay.setHours(23, 59, 59, 999);
    // Get all records for that date and organization
    const records = await CommunionAttendance.find({
      organization: req.organization,
      scannedAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("user");
    // Unique users for the latest event
    const uniqueUsers = new Set(
      records.map((r) => (r.user as any)._id.toString())
    );
    // Only count users in this organization
    const totalUsers = await User.countDocuments({
      organization: req.organization,
    });
    const attendanceRate =
      totalUsers > 0 ? (uniqueUsers.size / totalUsers) * 100 : 0;
    res.json({
      attendanceRate: attendanceRate.toFixed(2),
      lastScanDate: latestDate,
      totalParticipants: uniqueUsers.size,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
