import express from "express";
import {
  createAttendance,
  getAttendanceById,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController";

const router = express.Router();

// Get all attendance records
router.get("/", getAllAttendance);

// Get attendance by ID
router.get("/:attendanceId", getAttendanceById);

// Create new attendance record
router.post("/", createAttendance);

// Update attendance record
router.put("/:attendanceId", updateAttendance);

// Delete attendance record
router.delete("/:attendanceId", deleteAttendance);

export default router; 