import express from "express";
import {
  createClassAttendance,
  getClassAttendanceById,
  getAllClassAttendance,
  updateClassAttendance,
  deleteClassAttendance,
} from "../controllers/classAttendanceController";

const router = express.Router();

// Get all class attendance records (with optional filtering)
router.get("/", getAllClassAttendance);

// Get class attendance by ID
router.get("/:attendanceId", getClassAttendanceById);

// Create new class attendance record
router.post("/", createClassAttendance);

// Update class attendance record
router.put("/:attendanceId", updateClassAttendance);

// Delete class attendance record
router.delete("/:attendanceId", deleteClassAttendance);

export default router; 