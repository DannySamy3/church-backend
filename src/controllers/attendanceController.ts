import { Request, Response } from "express";
import { Attendance } from "../models/Attendance";

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { adultCount, minorCount, date } = req.body;

    // Validate required fields
    if (adultCount === undefined || minorCount === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "adultCount and minorCount are required",
      });
    }

    // Validate that counts are non-negative numbers
    if (typeof adultCount !== "number" || adultCount < 0) {
      return res.status(400).json({
        error: "Invalid adultCount",
        details: "adultCount must be a non-negative number",
      });
    }

    if (typeof minorCount !== "number" || minorCount < 0) {
      return res.status(400).json({
        error: "Invalid minorCount",
        details: "minorCount must be a non-negative number",
      });
    }

    // Check if attendance record already exists for the given date
    const existingAttendance = await Attendance.findOne({
      date: date ? new Date(date) : new Date(),
    });

    if (existingAttendance) {
      return res.status(400).json({
        error: "Attendance record already exists",
        details: "An attendance record for this date already exists",
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      adultCount,
      minorCount,
      date: date ? new Date(date) : new Date(),
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance record created successfully",
      attendance: {
        id: attendance._id,
        adultCount: attendance.adultCount,
        minorCount: attendance.minorCount,
        date: attendance.date,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.json({
      id: attendance._id,
      adultCount: attendance.adultCount,
      minorCount: attendance.minorCount,
      date: attendance.date,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching all attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const { adultCount, minorCount, date } = req.body;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // Validate that counts are non-negative numbers if provided
    if (adultCount !== undefined) {
      if (typeof adultCount !== "number" || adultCount < 0) {
        return res.status(400).json({
          error: "Invalid adultCount",
          details: "adultCount must be a non-negative number",
        });
      }
      attendance.adultCount = adultCount;
    }

    if (minorCount !== undefined) {
      if (typeof minorCount !== "number" || minorCount < 0) {
        return res.status(400).json({
          error: "Invalid minorCount",
          details: "minorCount must be a non-negative number",
        });
      }
      attendance.minorCount = minorCount;
    }

    if (date !== undefined) {
      attendance.date = new Date(date);
    }

    await attendance.save();

    res.json({
      message: "Attendance record updated successfully",
      attendance: {
        id: attendance._id,
        adultCount: attendance.adultCount,
        minorCount: attendance.minorCount,
        date: attendance.date,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    await attendance.deleteOne();

    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}; 