import express from "express";
import {
  getLatestAttendanceRecords,
  getAttendanceByDateRange,
  getLatestAttendanceStats,
} from "../controllers/communionAttendanceController";

const router = express.Router();

// Get all attendance records for the latest date
router.get("/latest", getLatestAttendanceRecords);

// Get attendance by date range
router.get("/range", getAttendanceByDateRange);

// Get latest attendance stats
router.get("/latest/stats", getLatestAttendanceStats);

export default router;
