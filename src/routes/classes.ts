import express from "express";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  createClassAttendance,
  getClassAttendance,
  getClassAttendanceByDate,
  updateClassAttendance,
  deleteClassAttendance,
} from "../controllers/classController";

const router = express.Router();

// Class Management Routes
router.get("/", getClasses);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

// Class Attendance Routes (nested under class)
router.get("/:classId/attendance", getClassAttendance);
router.get("/:classId/attendance/date/:date", getClassAttendanceByDate);
router.post("/:classId/attendance", createClassAttendance);
router.put("/:classId/attendance/:attendanceId", updateClassAttendance);
router.delete("/:classId/attendance/:attendanceId", deleteClassAttendance);

export default router; 